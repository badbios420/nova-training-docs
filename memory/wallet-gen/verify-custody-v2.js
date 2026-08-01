#!/usr/bin/env node
/**
 * Nova custody smoke — decrypt → re-derive payment + stake → match expected.
 * NEVER prints mnemonic / passphrase / private keys.
 * Exit 0 = PASS, 1 = FAIL, 2 = usage/env.
 */
'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');
const bip39 = require('bip39');
const CSL = require('@emurgo/cardano-serialization-lib-nodejs');

const ENC = '/home/mrbig3/.openclaw/workspace/memory/nova-mainnet-v2.enc';
const PASS = '/home/mrbig3/.openclaw/workspace/memory/.nova-wallet-key';
const EXPECTED_PAYMENT =
  'addr1q8acwcxa7w9dhrw609r6gvjd694qc3crfz9wy6u3m4a5vw2w9ykm9yp3awmeas3ycxvf5tg4wz0m6r3k843ngwjc5vuq5fjmj4';
const EXPECTED_STAKE =
  'stake1u98zjtdjjqc7hdu7cgjvrxy6952hp8aapcmr6ce58fv2xwqq4lzhf';

function die(code, msg) {
  console.error(msg);
  process.exit(code);
}

function wipeStringRef() {
  // best-effort; JS strings are immutable — avoid logging instead
}

try {
  for (const p of [ENC, PASS]) {
    if (!fs.existsSync(p)) die(2, `MISSING:${p}`);
    const mode = fs.statSync(p).mode & 0o777;
    if (mode !== 0o600) {
      console.log(`WARN_PERMS:${p}:0${mode.toString(8)} (want 600)`);
    }
  }

  // Decrypt via openssl; passphrase via file: (not argv pass:)
  let mnemonic;
  try {
    mnemonic = execFileSync(
      'openssl',
      ['enc', '-d', '-aes-256-cbc', '-pbkdf2', '-in', ENC, '-pass', `file:${PASS}`],
      { encoding: 'utf8', maxBuffer: 64 * 1024 }
    ).trim();
  } catch (e) {
    die(1, 'DECRYPT_FAIL');
  }

  const words = mnemonic.split(/\s+/).filter(Boolean);
  if (words.length !== 24) {
    wipeStringRef();
    die(1, `MNEMONIC_WORD_COUNT_FAIL:${words.length}`);
  }
  if (!bip39.validateMnemonic(mnemonic)) {
    wipeStringRef();
    die(1, 'MNEMONIC_CHECKSUM_FAIL');
  }

  const entropy = Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
  // drop mnemonic ASAP from our scope after entropy
  mnemonic = null;

  const emptyPassword = Buffer.from('');
  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, emptyPassword);
  entropy.fill(0);

  const accountKey = rootKey
    .derive(0x80000000 + 1852)
    .derive(0x80000000 + 1815)
    .derive(0x80000000 + 0);

  const paymentKey = accountKey.derive(0).derive(0);
  const stakeKey = accountKey.derive(2).derive(0);
  const paymentPub = paymentKey.to_public().to_raw_key();
  const stakePub = stakeKey.to_public().to_raw_key();

  let baseAddr;
  try {
    const paymentCred = CSL.StakeCredential.from_keyhash(paymentPub.hash());
    const stakeCred = CSL.StakeCredential.from_keyhash(stakePub.hash());
    baseAddr = CSL.BaseAddress.new(1, paymentCred, stakeCred);
  } catch {
    const paymentCred = CSL.Credential.from_keyhash(paymentPub.hash());
    const stakeCred = CSL.Credential.from_keyhash(stakePub.hash());
    baseAddr = CSL.BaseAddress.new(1, paymentCred, stakeCred);
  }

  const payment = baseAddr.to_address().to_bech32();
  const stake = CSL.RewardAddress.new(1, baseAddr.stake_cred()).to_address().to_bech32();

  const payOk = payment === EXPECTED_PAYMENT;
  const stakeOk = stake === EXPECTED_STAKE;

  console.log(
    JSON.stringify(
      {
        check: 'custody-verify-v2',
        at: new Date().toISOString(),
        decrypt: 'ok',
        mnemonicWords: 24,
        bip39Checksum: 'ok',
        paymentMatch: payOk,
        stakeMatch: stakeOk,
        payment: payment,
        stake: stake,
        result: payOk && stakeOk ? 'PASS' : 'FAIL',
      },
      null,
      2
    )
  );

  process.exit(payOk && stakeOk ? 0 : 1);
} catch (e) {
  die(1, `UNEXPECTED_FAIL:${e && e.message ? e.message : e}`);
}
