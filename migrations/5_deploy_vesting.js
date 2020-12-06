let TreasuryVester = artifacts.require('TreasuryVester.sol')

let token = ''
let recipient = ''
let amount = web3.utils.toWei('958333')
let begin = 1607428800 
let cliff = begin
let end = begin + (year * 2)

module.exports = async deployer => {
  return deployer.deploy(TreasuryVester, token, recipient, amount, begin, cliff, end) 
}