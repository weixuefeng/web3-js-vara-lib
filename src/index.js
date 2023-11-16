// import { Keyring } from '@polkadot/keyring'
// import { u8aToHex, isHex } from '@polkadot/util'
// import { sr25519PairFromSeed, } from '@polkadot/util-crypto/sr25519'
// import { GearApi } from '@gear-js/api'
// import { cryptoWaitReady, mnemonicToMiniSecret } from '@polkadot/util-crypto'
const { Buffer } = require('buffer');

const {Keyring} = require("@polkadot/keyring")
const {u8aToHex, isHex} = require("@polkadot/util")
const {sr25519PairFromSeed} = require("@polkadot/util-crypto/sr25519")
const {GearApi} = require("@gear-js/api")
const {cryptoWaitReady, mnemonicToMiniSecret} = require("@polkadot/util-crypto")

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
}

async function createWalletByMnemonic(mnemonic, networkType) {
  await cryptoWaitReady()
  var seed = u8aToHex(mnemonicToMiniSecret(mnemonic));
  var keypair = sr25519PairFromSeed(mnemonicToMiniSecret(mnemonic))
  var keyring = new Keyring({ss58Format: networkType, type:'sr25519'});
  var keyringPair = keyring.addFromPair(keypair);
  return {
    "address": keyringPair.address,
    "pubkey": buf2hex(keyringPair.publicKey),
    "secret": u8aToHex(keypair.secretKey),
    "privateKey": seed
  };
}

async function getVaraBalance(address, rpc) {
  const gearApi = await GearApi.create({
    providerAddress: rpc, 
  });
  var response = await gearApi.query.system.account(address);
  await gearApi.disconnect()
  return response.data.free.toString();
}

async function transferVara(mnemonic, to, amount, rpc, networkType) {
  const gearApi = await GearApi.create({
    providerAddress: rpc, 
  });
  await cryptoWaitReady()
  var keyring =  new Keyring({ss58Format: networkType, type:'sr25519'})
  var pair =  keyring.addFromMnemonic(mnemonic);
  var tx = await gearApi.balance.transfer(to, amount).signAndSend(pair);
  await gearApi.disconnect();
  return tx.toHuman();
}

async function calculateFeeForVaraTransfer(mnemonic, to, amount, rpc, networkType) {
  const gearApi = await GearApi.create({
    providerAddress: rpc,
  });
  await cryptoWaitReady()
  var keyring =  new Keyring({ss58Format: networkType, type:'sr25519'})
  var pair =  keyring.addFromMnemonic(mnemonic);
  try{
    var tx = await gearApi.tx.balances.transfer(to, amount).paymentInfo(pair);
    return tx.toHuman();
  }catch(e) {
    console.log("error->", e)
  } finally {
    await gearApi.disconnect();
  }
}


// window.varaNetwork = {
//   createWalletByMnemonic,
//   getVaraBalance,
//   calculateFeeForVaraTransfer,
//   transferVara
// }

var varaNetwork = {
  createWalletByMnemonic,
  getVaraBalance,
  calculateFeeForVaraTransfer,
  transferVara
}

module.exports = varaNetwork
