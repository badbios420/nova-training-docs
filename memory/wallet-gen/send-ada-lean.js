const CSL = require('@emurgo/cardano-serialization-lib-nodejs');
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

// Params
const MIN_FEE_A = 44;
const MIN_FEE_B = 155381;
const TTL = 190670834 + 1200; // current slot + 20min

const myAddr = 'addr1q8acwcxa7w9dhrw609r6gvjd694qc3crfz9wy6u3m4a5vw2w9ykm9yp3awmeas3ycxvf5tg4wz0m6r3k843ngwjc5vuq5fjmj4';
const toAddr = 'addr1qxk5wljp28eeghjughaeak20q4anvr7zt4xqddya6m9vuqzv0shkuft5skdzw2h84q9pcq7mne0glnpt0aytum0h9x7sw7lnx2';
const utxoHash = 'b1a74ac93b73784e7a7713c202f96133d66cea8fbbffe735638e89c0e8f9512b';
const UTXO_AMT = 10000000;
const SEND_AMT = 2000000;

// 1. Decrypt mnemonic
const pass = fs.readFileSync('/home/mrbig3/.openclaw/workspace/memory/.nova-wallet-key','utf8').trim();
const mnemonic = execSync('openssl enc -d -aes-256-cbc -pbkdf2 -in /home/mrbig3/.openclaw/workspace/memory/nova-mainnet-v2.enc -pass pass:'+pass).toString().trim();

// 2. Derive signing key
const bip39 = require('bip39');
const entropy = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
const root = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, Buffer.from(''));
const paymentPriv = root.derive(0x80000000+1852).derive(0x80000000+1815).derive(0x80000000+0).derive(0).derive(0).to_raw_key();

// 3. Build inputs
const input = CSL.TransactionInput.new(
  CSL.TransactionHash.from_bytes(Buffer.from(utxoHash, 'hex')), 0
);
const inputs = CSL.TransactionInputs.new();
inputs.add(input);

// 4. Build outputs with dummy fee for size measurement
const dummyChange = UTXO_AMT - SEND_AMT - 200000;
const out1 = CSL.TransactionOutput.new(CSL.Address.from_bech32(toAddr), CSL.Value.new(CSL.BigNum.from_str(String(SEND_AMT))));
const out2 = CSL.TransactionOutput.new(CSL.Address.from_bech32(myAddr), CSL.Value.new(CSL.BigNum.from_str(String(dummyChange))));
const outs = CSL.TransactionOutputs.new();
outs.add(out1);
outs.add(out2);

const dummyBody = CSL.TransactionBody.new(inputs, outs, CSL.BigNum.from_str('200000'), CSL.BigNum.from_str(String(TTL)));

// 5. Sign dummy to measure full tx size
const dummyHash = CSL.hash_transaction(dummyBody);
const dummyWit = CSL.make_vkey_witness(dummyHash, paymentPriv);
const ws = CSL.TransactionWitnessSet.new();
ws.add_vkey(dummyWit);
const dummyTx = CSL.Transaction.new(dummyBody, ws, undefined);
const txSize = dummyTx.to_bytes().length;

// 6. Calculate real fee
const fee = MIN_FEE_A * txSize + MIN_FEE_B;
const change = UTXO_AMT - SEND_AMT - fee;

console.log('TX size:', txSize, 'bytes');
console.log('Fee:', fee, 'lovelace (' + (fee/1000000).toFixed(6) + ' ADA)');
console.log('Change:', change, 'lovelace (' + (change/1000000).toFixed(6) + ' ADA)');

// 7. Build real transaction
const realOut2 = CSL.TransactionOutput.new(CSL.Address.from_bech32(myAddr), CSL.Value.new(CSL.BigNum.from_str(String(change))));
const realOuts = CSL.TransactionOutputs.new();
realOuts.add(out1);
realOuts.add(realOut2);
const realBody = CSL.TransactionBody.new(inputs, realOuts, CSL.BigNum.from_str(String(fee)), CSL.BigNum.from_str(String(TTL)));

// 8. Sign real transaction
const txHash = CSL.hash_transaction(realBody);
const wit = CSL.make_vkey_witness(txHash, paymentPriv);
const witnessSet = CSL.TransactionWitnessSet.new();
witnessSet.add_vkey(wit);
const tx = CSL.Transaction.new(realBody, witnessSet, undefined);
const txBytes = tx.to_bytes();

console.log('Final TX size:', txBytes.length, 'bytes');
console.log('Signing verified ✅');

// 9. Submit via Koios
const req = https.request({
  hostname: 'api.koios.rest',
  path: '/api/v1/submittx',
  method: 'POST',
  headers: { 'Content-Type': 'application/cbor', 'Content-Length': txBytes.length }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('\nSubmit status:', res.statusCode);
    console.log('Response:', data);
    if (res.statusCode === 202) {
      console.log('\n✅ SUBMITTED! TX Hash:', data.trim().replace(/"/g,''));
    } else {
      console.log('❌ Failed');
      fs.writeFileSync('/tmp/tx_debug.hex', Buffer.from(txBytes).toString('hex'));
      console.log('Debug hex saved to /tmp/tx_debug.hex');
    }
    process.exit(0);
  });
});
req.on('error', e => { console.error('Network error:', e.message); process.exit(1); });
req.write(Buffer.from(txBytes));
req.end();
