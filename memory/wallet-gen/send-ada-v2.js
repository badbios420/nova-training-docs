const CSL = require('@emurgo/cardano-serialization-lib-nodejs');
const bip39 = require('bip39');
const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

const MIN_FEE_A = 44;
const MIN_FEE_B = 155381;
const TTL = 190670834 + 1200;

const myAddr = 'addr1q8acwcxa7w9dhrw609r6gvjd694qc3crfz9wy6u3m4a5vw2w9ykm9yp3awmeas3ycxvf5tg4wz0m6r3k843ngwjc5vuq5fjmj4';
const toAddr = 'addr1qxk5wljp28eeghjughaeak20q4anvr7zt4xqddya6m9vuqzv0shkuft5skdzw2h84q9pcq7mne0glnpt0aytum0h9x7sw7lnx2';
const utxoHash = 'b1a74ac93b73784e7a7713c202f96133d66cea8fbbffe735638e89c0e8f9512b';
const UTXO_AMT = 10000000;
const SEND_AMT = 2000000;

// 1. Decrypt mnemonic + derive signing key
const pass = fs.readFileSync('/home/mrbig3/.openclaw/workspace/memory/.nova-wallet-key', 'utf8').trim();
const mnemonic = execSync('openssl enc -d -aes-256-cbc -pbkdf2 -in /home/mrbig3/.openclaw/workspace/memory/nova-mainnet-v2.enc -pass pass:' + pass).toString().trim();
const entropy = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
const root = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, Buffer.from(''));
const paymentPriv = root.derive(0x80000000 + 1852).derive(0x80000000 + 1815).derive(0x80000000 + 0).derive(0).derive(0).to_raw_key();

// 2. Build inputs
const inputs = CSL.TransactionInputs.new();
inputs.add(CSL.TransactionInput.new(
  CSL.TransactionHash.from_bytes(Buffer.from(utxoHash, 'hex')), 0
));

// 3. Build outputs with dummy fee for size measurement
const dummyChange = UTXO_AMT - SEND_AMT - 200000;
const out1 = CSL.TransactionOutput.new(
  CSL.Address.from_bech32(toAddr),
  CSL.Value.new(CSL.BigNum.from_str(String(SEND_AMT)))
);
const out2 = CSL.TransactionOutput.new(
  CSL.Address.from_bech32(myAddr),
  CSL.Value.new(CSL.BigNum.from_str(String(dummyChange)))
);
const outs = CSL.TransactionOutputs.new();
outs.add(out1);
outs.add(out2);

const dummyBody = CSL.TransactionBody.new(
  inputs, outs, CSL.BigNum.from_str('200000'), TTL
);

// 4. Sign dummy to measure full tx size
const dummyFixed = CSL.FixedTransactionBody.from_bytes(dummyBody.to_bytes());
const dummyHash = dummyFixed.tx_hash();
const dummyWit = CSL.make_vkey_witness(dummyHash, paymentPriv);
const dummyWits = CSL.Vkeywitnesses.new();
dummyWits.add(dummyWit);
const dummyWs = CSL.TransactionWitnessSet.new();
dummyWs.set_vkeys(dummyWits);
const dummyTx = CSL.Transaction.new(dummyBody, dummyWs, undefined);
const txSize = dummyTx.to_bytes().length;

// 5. Calculate real fee + change
const fee = MIN_FEE_A * txSize + MIN_FEE_B;
const change = UTXO_AMT - SEND_AMT - fee;

console.log('TX size:', txSize, 'bytes');
console.log('Fee:', fee, 'lovelace (' + (fee / 1000000).toFixed(6) + ' ADA)');
console.log('Change:', change, 'lovelace (' + (change / 1000000).toFixed(6) + ' ADA)');

// 6. Build real transaction
const realOuts = CSL.TransactionOutputs.new();
realOuts.add(out1);
realOuts.add(CSL.TransactionOutput.new(
  CSL.Address.from_bech32(myAddr),
  CSL.Value.new(CSL.BigNum.from_str(String(change)))
));
const realBody = CSL.TransactionBody.new(
  inputs, realOuts, CSL.BigNum.from_str(String(fee)), TTL
);

// 7. Sign real transaction
const realFixed = CSL.FixedTransactionBody.from_bytes(realBody.to_bytes());
const realHash = realFixed.tx_hash();
const realWit = CSL.make_vkey_witness(realHash, paymentPriv);
const realWits = CSL.Vkeywitnesses.new();
realWits.add(realWit);
const realWs = CSL.TransactionWitnessSet.new();
realWs.set_vkeys(realWits);
const tx = CSL.Transaction.new(realBody, realWs, undefined);
const txBytes = tx.to_bytes();

console.log('Final TX size:', txBytes.length, 'bytes');
console.log('Signed ✅');

// 8. Submit via Koios
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
      console.log('\n✅ SUBMITTED! TX Hash:', data.trim().replace(/"/g, ''));
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
