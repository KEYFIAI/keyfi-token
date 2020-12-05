let Airdrop = artifacts.require('Airdrop.sol')

let token = '0x4CC19356f2D37338b9802aa8E8fc58B0373296E7'
let whitelist = '0xc3faa8e87cd7b3678fa10c0f9638eb4ba7da20c5'
let amount = '20000000000000000000000'

module.exports = async deployer => {
  return deployer.deploy(Airdrop, token, whitelist, amount)
}