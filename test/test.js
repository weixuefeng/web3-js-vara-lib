
const config = require("./env.js")
const vara = require("../src/index.js")

async function testCreateWallet() {
    var res = await vara.createWalletByMnemonic(config.mnemonic, 137)
    console.log(res);
}

async function testCalculateFee() {
    var fee = await vara.calculateFeeForVaraTransfer(config.mnemonic, config.toAddress, 100, config.rpc, config.networkType);
    console.log("fee:", fee);
}

async function testTransfer() {
    var res = await vara.transferVara(config.mnemonic, config.toAddress, 100, config.rpc, config.networkType);
    console.log("res:", res);
}

async function testGetBalance() {
    var balance = await vara.getVaraBalance(config.toAddress, config.rpc);
    console.log("balance:", balance);
}

function test() {
    testGetBalance()
}

test()