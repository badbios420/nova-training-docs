const bip39 = require('bip39');
const crypto = require('crypto');
const { execSync } = require('child_process');
const CSL = require('@emurgo/cardano-serialization-lib-nodejs');

// === STEP 1: Generate new wallet ===
const mnemonic = bip39.generateMnemonic(256); // 24-word mnemonic
const entropy = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
const emptyPassword = Buffer.from('');

// Derive keys per CIP-1852
const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, emptyPassword);
const accountKey = rootKey
  .derive(0x80000000 + 1852)
  .derive(0x80000000 + 1815)
  .derive(0x80000000 + 0);

const paymentKey = accountKey.derive(0).derive(0);
const stakeKey = accountKey.derive(2).derive(0);

// Build address
const paymentPub = paymentKey.to_public().to_raw_key();
const stakePub = stakeKey.to_public().to_raw_key();

let baseAddr;
try {
  const paymentCred = CSL.StakeCredential.from_keyhash(paymentPub.hash());
  const stakeCred = CSL.StakeCredential.from_keyhash(stakePub.hash());
  baseAddr = CSL.BaseAddress.new(1, paymentCred, stakeCred);
} catch(e) {
  const paymentCred = CSL.Credential.from_keyhash(paymentPub.hash());
  const stakeCred = CSL.Credential.from_keyhash(stakePub.hash());
  baseAddr = CSL.BaseAddress.new(1, paymentCred, stakeCred);
}

const address = baseAddr.to_address().to_bech32();

// === STEP 2: Generate a strong random passphrase ===
const passphrase = crypto.randomBytes(32).toString('hex');

// === STEP 3: Encrypt mnemonic with openssl AES-256-CBC ===
const encPath = '/home/mrbig3/.openclaw/workspace/memory/nova-mainnet-v2.enc';
const passPath = '/home/mrbig3/.openclaw/workspace/memory/.nova-wallet-key';

// Write mnemonic to temp file, encrypt with openssl
const tmpFile = '/tmp/_mnemonic_tmp.txt';
require('fs').writeFileSync(tmpFile, mnemonic, { mode: 0o600 });

try {
  execSync(`openssl enc -aes-256-cbc -pbkdf2 -salt -in ${tmpFile} -out ${encPath} -pass pass:${passphrase}`);
  execSync(`chmod 600 ${encPath}`);
  
  // Write passphrase to restricted file
  require('fs').writeFileSync(passPath, passphrase, { mode: 0o600 });
  execSync(`chmod 600 ${passPath}`);
  
  // Secure delete temp file
  execSync(`shred -u ${tmpFile}`);
} catch(e) {
  console.error('Encryption failed:', e.message);
  process.exit(1);
}

// === STEP 4: Verify roundtrip — decrypt and re-derive address ===
try {
  const decrypted = execSync(`openssl enc -d -aes-256-cbc -pbkdf2 -in ${encPath} -pass pass:${passphrase}`).toString().trim();
  
  if (decrypted !== mnemonic) {
    console.error('VERIFICATION FAILED: decrypted mnemonic does not match original');
    process.exit(1);
  }
  
  // Re-derive address from decrypted mnemonic
  const entropy2 = Buffer.from(bip39.mnemonicToEntropy(decrypted), 'hex');
  const rootKey2 = CSL.Bip32PrivateKey.from_bip39_entropy(entropy2, emptyPassword);
  const accountKey2 = rootKey2
    .derive(0x80000000 + 1852)
    .derive(0x80000000 + 1815)
    .derive(0x80000000 + 0);
  const paymentKey2 = accountKey2.derive(0).derive(0);
  const stakeKey2 = accountKey2.derive(2).derive(0);
  
  const paymentPub2 = paymentKey2.to_public().to_raw_key();
  const stakePub2 = stakeKey2.to_public().to_raw_key();
  
  let baseAddr2;
  try {
    const pc2 = CSL.StakeCredential.from_keyhash(paymentPub2.hash());
    const sc2 = CSL.StakeCredential.from_keyhash(stakePub2.hash());
    baseAddr2 = CSL.BaseAddress.new(1, pc2, sc2);
  } catch(e) {
    const pc2 = CSL.Credential.from_keyhash(paymentPub2.hash());
    const sc2 = CSL.Credential.from_keyhash(stakePub2.hash());
    baseAddr2 = CSL.BaseAddress.new(1, pc2, sc2);
  }
  
  const address2 = baseAddr2.to_address().to_bech32();
  
  if (address !== address2) {
    console.error('VERIFICATION FAILED: re-derived address does not match');
    console.error('Original:', address);
    console.error('Re-derived:', address2);
    process.exit(1);
  }
  
  // === STEP 5: Verify we can derive the private signing key (needed for transactions) ===
  const paymentPrivKeyBech32 = paymentKey.to_raw_key().to_bech32();
  
  // Verify we can re-derive it from decrypted mnemonic
  const paymentPrivKey2 = paymentKey2.to_raw_key().to_bech32();
  
  if (paymentPrivKeyBech32 !== paymentPrivKey2) {
    console.error('VERIFICATION FAILED: private signing key does not match after roundtrip');
    process.exit(1);
  }
  
  // === SUCCESS: Output only safe info ===
  console.log(JSON.stringify({
    status: 'SUCCESS',
    address: address,
    stake_address: 'stake_test_placeholder', // will fill below
    encrypted_mnemonic_path: encPath,
    passphrase_path: passPath,
    verification: {
      mnemonic_roundtrip: 'PASS',
      address_rederivation: 'PASS',
      signing_key_rederivation: 'PASS',
      full_operational_control: true
    },
    note: 'Mnemonic encrypted at rest. Passphrase stored separately with chmod 600. Private signing key derivable from decrypted mnemonic.'
  }, null, 2));
  
} catch(e) {
  console.error('Verification failed:', e.message);
  process.exit(1);
}
