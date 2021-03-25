let TreasuryVester = artifacts.require('TreasuryVester.sol')

const year = 31536000

let token = '0xCfEC6722f119240B97effd5Afe04c8a97caA02EE'
let recipient = '0xFdb6ac6750690D9c46d038f2536eC995D9d3D6d8'
let amount = web3.utils.toWei('958333')
let begin = 9999999999
let cliff = begin
let end = begin + (year * 2)

module.exports = async deployer => {
  return deployer.deploy(TreasuryVester, token, recipient, amount, begin, cliff, end) 
}