# keyfi-token

Smart contracts implementing KeyFi token economics backend.

## Smart Contract Overview 

This repository contains the smart contracts that implement the KEYFI token and its distribution mechanism, based on staking LP tokens. The following contracts are provided:

### KeyfiToken.sol

`KeyfiToken` is an ERC20-compatible token contract, with minting functionality and vote delegation (based on Compound governance token). Only the contract owner is able to mint additional tokens. The ownership of the token is planned to be held by a community-controlled governance contract.

A governance contract such as Compound's "Governor Alpha" or a variation of it is planned to be introduced in next stages of development.

### RewardPool.sol

`RewardPool` is the main mechanism for distributing KEYFI, by means of allocating tokens to a configurable set of "staking tokens" (e.g. Uniswap LP tokens). As the token, the Reward Pool contract is also `Ownable` and meant to be controlled by community governance.

The contract is based on SushiSwap's `MasterChef` contract, with a few changes:

* It doesn't mint new tokens, the reward tokens need to be previously minted and deposited to the contract
* It includes management functions such as `removeStakingToken` and `adminWithdrawReward`
* All method interfaces receive a token address instead of a numeric "pid". Token index (pid) is still used to loop through tokens internally

A number of tokens is allocated each block, divided among all the different staking tokens or "pools". Each stakeholder should receive rewards according to their share of the pool stake. A bonus period is optionally set at deployment time, with a multiplier for rewards in said period.

Token rewards are automatically withdrawn on each call to `deposit` and `withdraw` functions. These can be used with `amount = 0` in order to only withdraw the rewards.

**Note**: Reward pool doesn't mint tokens in order to distribute rewards, therefore it must _always_ hold enough reward funds. Contract owners should either re-supply or migrate to an alternate reward contract when the supply is about to end. Querying `rewardBlocksLeft` function is useful for this matter.

### KeyfiTokenFactory.sol

KeyfiTokenFactory is the deployer and initializer of the token and reward contracts. It implements the initial token distribution and transfers ownership of both contracts to a proper admin. The factory contract also deploys a set of token timelocks as initially determined by the initial distribution scheme defined by the KeyFi team.

### MultisigTimelock.sol

A simple multisig timelock contract (based on DDEX's `MultiSigWalletWithTimelock`) is provided in order to act as the "admin key" of relevant ownable contracts provisionally. This is meant to be substituted by a proper community voting contract such as Compound's "Governor Alpha" in the next stages.

## Development

Smart contracts are being implemented using Solidity `0.6.0`.

### Prerequisites

* [NodeJS](htps://nodejs.org), version 9.5+ (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
* [truffle](http://truffleframework.com/), which is a comprehensive framework for Ethereum development. `npm install -g truffle` — this should install the latest truffle version.

### Initialization

    npm install

### Testing

#### Standalone

    npm test

or with code coverage

    npm run test:cov

#### From within Truffle

Run the `truffle` development environment

    truffle develop

then from the prompt you can run

    compile
    migrate
    test

as well as other Truffle commands. See [truffleframework.com](http://truffleframework.com) for more.

## Contributing

Please see the [contributing notes](CONTRIBUTING.md).
