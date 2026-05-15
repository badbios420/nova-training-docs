// Cardano Mainnet Base Address Gen
const bip39 = require('bip39');
const CSL = require('@emurgo/cardano-serialization-lib-nodejs');

const mnemonic = bip39.generateMnemonic(256);
const seed = bip39.mnemonicToSeedSync(mnemonic, '');
const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(seed, '');

// Payment key: m/1852'/1815'/0'/0/0
const paymentPriv = rootKey.derive(1852).derive(1815).derive(0).derive(0).derive(0);
const paymentPub = paymentPriv.to_public();
const paymentKeyhash = paymentPub.hash();

// Stake key: m/1852'/1815'/0'/2/0
const stakePriv = rootKey.derive(1852).derive(1815).derive(0).derive(2).derive(0);
const stakePub = stakePriv.to_public();
const stakeKeyhash = stakePub.hash();

// Base addr mainnet
const baseAddr = CSL.BaseAddress.new_network(
  CSL.NetworkId.mainnet(),
  CSL.BaseAddress.new(
    CSL.Credential.new_keyhash(paymentKeyhash),
    CSL.Credential.new_keyhash(stakeKeyhash)
  )
);

const address = baseAddr.to_bech32();
const privKey = rootKey.to_bech32(); // Root for recovery

console.log(JSON.stringify({
  mnemonic,
  rootPrivateKey: privKey,
  address,
  explorer: `https://cardanoscan.io/address/${address}`
}, null, 2));
