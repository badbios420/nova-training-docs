const bip39 = require('bip39');
const CSL = require('@emurgo/cardano-serialization-lib-nodejs');
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };
    if (options.body) reqOptions.headers['Content-Length'] = options.body.length;
    const req = https.request(reqOptions, (res) => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function main() {
  // === STEP 1: Get protocol params + tip ===
  console.log('Step 1: Protocol parameters...');
  const paramsRes = await fetch('https://api.koios.rest/api/v1/epoch_params');
  const params = JSON.parse(paramsRes.body)[0];
  const MIN_FEE_A = params.min_fee_a;
  const MIN_FEE_B = params.min_fee_b;
  const COINS_PER_UTXO_BYTE = params.coins_per_utxo_size;
  console.log('  min_fee_a:', MIN_FEE_A, '| min_fee_b:', MIN_FEE_B, '| coins_per_utxo_byte:', COINS_PER_UTXO_BYTE);

  const tipRes = await fetch('https://api.koios.rest/api/v1/tip');
  const tip = JSON.parse(tipRes.body)[0];
  const ttl = tip.abs_slot + 1200;
  console.log('  Current slot:', tip.abs_slot, '| TTL:', ttl);

  // === STEP 2: Decrypt mnemonic + derive keys ===
  console.log('\nStep 2: Decrypting mnemonic...');
  const passPath = '/home/mrbig3/.openclaw/workspace/memory/.nova-wallet-key';
  const encPath = '/home/mrbig3/.openclaw/workspace/memory/nova-mainnet-v2.enc';
  const pass = fs.readFileSync(passPath, 'utf8').trim();
  const mnemonic = execSync(`openssl enc -d -aes-256-cbc -pbkdf2 -in ${encPath} -pass pass:${pass}`).toString().trim();
  console.log('  Mnemonic:', mnemonic.split(' ').length, 'words ✅');

  const entropy = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, Buffer.from(''));
  const accountKey = rootKey.derive(0x80000000 + 1852).derive(0x80000000 + 1815).derive(0x80000000 + 0);
  const paymentKey = accountKey.derive(0).derive(0);
  const paymentPrivKey = paymentKey.to_raw_key();
  console.log('  Signing key derived ✅');

  // === STEP 3: Build transaction manually ===
  console.log('\nStep 3: Building transaction...');
  const myAddrStr = 'addr1q8acwcxa7w9dhrw609r6gvjd694qc3crfz9wy6u3m4a5vw2w9ykm9yp3awmeas3ycxvf5tg4wz0m6r3k843ngwjc5vuq5fjmj4';
  const toAddrStr = 'addr1qxk5wljp28eeghjughaeak20q4anvr7zt4xqddya6m9vuqzv0shkuft5skdzw2h84q9pcq7mne0glnpt0aytum0h9x7sw7lnx2';
  const utxoTxHash = 'b1a74ac93b73784e7a7713c202f96133d66cea8fbbffe735638e89c0e8f9512b';
  const utxoIndex = 0;
  const utxoAmount = 10000000; // 10 ADA
  const sendAmount = 2000000;  // 2 ADA

  // Input
  const txInput = CSL.TransactionInput.new(
    CSL.TransactionHash.from_bytes(Buffer.from(utxoTxHash, 'hex')),
    utxoIndex
  );
  const inputs = CSL.TransactionInputs.new();
  inputs.add(txInput);

  // Output 1: 2 ADA to Jason
  const output1 = CSL.TransactionOutput.new(
    CSL.Address.from_bech32(toAddrStr),
    CSL.Value.new(CSL.BigNum.from_str(String(sendAmount)))
  );

  // Step 3a: Build with dummy fee + dummy change to measure size
  const dummyChange = utxoAmount - sendAmount - 200000; // rough estimate
  const output2 = CSL.TransactionOutput.new(
    CSL.Address.from_bech32(myAddrStr),
    CSL.Value.new(CSL.BigNum.from_str(String(dummyChange)))
  );

  const outputsList = CSL.TransactionOutputList.new();
  outputsList.add(output1);
  outputsList.add(output2);

  // Build dummy body to measure size
  const dummyFee = CSL.BigNum.from_str('200000');
  const dummyBody = CSL.TransactionBody.new(inputs, outputsList, dummyFee, CSL.BigNum.from_str(String(ttl)));

  // Build dummy witness to measure full tx size
  const dummyTxHash = CSL.hash_transaction(dummyBody);
  const dummyWitness = CSL.make_vkey_witness(dummyTxHash, paymentPrivKey);
  const witnessesSet = CSL.TransactionWitnessSet.new();
  witnessesSet.add_vkey(dummyWitness);
  const dummyTx = CSL.Transaction.new(dummyBody, witnessesSet, undefined);
  const txSize = dummyTx.to_bytes().length;
  console.log('  Estimated tx size:', txSize, 'bytes');

  // Calculate actual fee: fee = min_fee_a * size + min_fee_b
  const actualFee = MIN_FEE_A * txSize + MIN_FEE_B;
  console.log('  Calculated fee:', actualFee, 'lovelace (' + (actualFee / 1000000).toFixed(6) + ' ADA)');

  // Calculate change
  const changeAmount = utxoAmount - sendAmount - actualFee;
  console.log('  Change:', changeAmount, 'lovelace (' + (changeAmount / 1000000).toFixed(6) + ' ADA)');

  if (changeAmount < COINS_PER_UTXO_BYTE * 160) {
    console.log('  ⚠️ Change below min UTxO threshold. Adjusting...');
    // If change is too small, just add it to fee (no change output)
    // But for 10 ADA -> 2 ADA, change should be ~7.8 ADA, well above min
  }

  // Step 3b: Build actual transaction with correct fee + change
  const realOutput2 = CSL.TransactionOutput.new(
    CSL.Address.from_bech32(myAddrStr),
    CSL.Value.new(CSL.BigNum.from_str(String(changeAmount)))
  );

  const realOutputs = CSL.TransactionOutputList.new();
  realOutputs.add(output1);
  realOutputs.add(realOutput2);

  const realFee = CSL.BigNum.from_str(String(actualFee));
  const txBody = CSL.TransactionBody.new(inputs, realOutputs, realFee, CSL.BigNum.from_str(String(ttl)));
  console.log('  Transaction body built ✅');

  // === STEP 4: Sign ===
  console.log('\nStep 4: Signing...');
  const txHash = CSL.hash_transaction(txBody);
  const witness = CSL.make_vkey_witness(txHash, paymentPrivKey);
  const witnessSet = CSL.TransactionWitnessSet.new();
  witnessSet.add_vkey(witness);

  const tx = CSL.Transaction.new(txBody, witnessSet, undefined);
  const txBytes = tx.to_bytes();
  const txHex = Buffer.from(txBytes).toString('hex');
  console.log('  Signed. Final size:', txBytes.length, 'bytes');
  console.log('  Final fee:', actualFee, 'lovelace');
  console.log('  Send: 2 ADA to', toAddrStr.substring(0, 25) + '...');
  console.log('  Change:', changeAmount, 'lovelace back to me');

  // === STEP 5: Submit ===
  console.log('\nStep 5: Submitting to Cardano mainnet...');
  const submitRes = await fetch('https://api.koios.rest/api/v1/submittx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/cbor' },
    body: Buffer.from(txBytes)
  });

  console.log('  Status:', submitRes.status);
  console.log('  Response:', submitRes.body);

  if (submitRes.status === 202) {
    console.log('\n✅ TRANSACTION SUBMITTED SUCCESSFULLY!');
    console.log('  TX Hash:', submitRes.body.trim().replace(/"/g, ''));
    console.log('  Amount: 2 ADA');
    console.log('  Fee:', actualFee, 'lovelace');
    console.log('  Change:', changeAmount, 'lovelace');
  } else {
    console.log('\n❌ Submission failed');
    try {
      console.log('  Error:', JSON.stringify(JSON.parse(submitRes.body), null, 2));
    } catch(e) {
      console.log('  Raw:', submitRes.body);
    }
    // Save tx hex for debugging
    fs.writeFileSync('/tmp/tx_debug.hex', txHex);
    console.log('  TX hex saved to /tmp/tx_debug.hex for debugging');
  }
}

main().catch(e => { console.error('FATAL:', e.message || e); process.exit(1); });
