# keyfi-token

Smart contracts implementing KeyFi token economics backend.

## Smart Contract Overview 

This repository contains the smart contracts that implement the KEYFI token and its distribution mechanism, based on staking LP tokens. The following contracts are provided:

### KeyfiToken.sol

`KeyfiToken` is an ERC20-compatible token contract, with minting functionality and vote delegation (based on Compound governance token). Only the contract `minter` is able to mint additional tokens. The `owner` role of the token contract is planned to be held by the community through decentralized governance. (Governance.sol) and will be able to change minter address and all the minting parameters.

#### Inflationary minting

There is a `minter` address that is able to mint new tokens every allowed period. This minting capability is capped by a percentage of the total supply. In the Keyfi system, the community-controlled governance contract could be a minter, but the community could decide to transfer minting capabilitis to a smart contract while keeping ownership over the token. 

Additionally, there will be a period of 2 years in which not even the minter address will be able to mint additional tokens, in order to mitigate for any potential risks associated with the minting capability and ensuring that the proper governance mechanisms are in place before minting is enabled.

**Notes on governance and contract ownership**: contracts are being implemented allowing enough flexibility for the community to control factors such as the minting and reward parameters. However, the goal of the governance platform is to allow the community to decide to relinquish control of any aspect of the network, if said proposals get enough votes. (e.g. transfer token `owner` to a _zero_ address). The intent is to leave those decisions to the community.

### RewardPool.sol

`RewardPool` is the main mechanism for distributing KEYFI, by means of allocating tokens to a configurable set of "staking tokens" (e.g. Uniswap LP tokens). As the token, the Reward Pool contract is also `Ownable` and meant to be controlled by community governance.

The contract is based on SushiSwap's `MasterChef` contract, with a few changes:

* It doesn't mint new tokens, the reward tokens need to be previously minted and deposited to the contract
* It includes management functions such as `removeStakingToken` and `adminWithdrawReward`
* All method interfaces receive a token address instead of a numeric "pid". Token index (pid) is still used to loop through tokens internally

A number of tokens is allocated each block, divided among all the different staking tokens or "pools". Each stakeholder should receive rewards according to their share of the pool stake. A bonus period is optionally set at deployment time, with a multiplier for rewards in said period.

Token rewards are automatically withdrawn on each call to `deposit` and `withdraw` functions. These can be used with `amount = 0` in order to only withdraw the rewards.

**Note**: Reward pool doesn't mint tokens in order to distribute rewards, therefore it must _always_ hold enough reward funds. Contract owners should either re-supply or migrate to an alternate reward contract when the supply is about to end. Querying `rewardBlocksLeft` function is useful for this matter.

The following public methods are provided by the Reward Pool contract:

* **function pendingReward(IERC20 _token, address _user) returns uint256**: calculates pending reward for a given staking token and a user
* **function deposit(IERC20 _token, uint256 _amount)**: deposit a given amount to a staking pool (LP tokens or any other allowed ERC20). It also sends any pending reward to the user.
* **function withdraw(IERC20 _token, uint256 _amount)**: withdraw any available amount of staking token + pending rewards
* **function rewardBlocksLeft() returns uint256**: calculates how many blocks are left with available tokens to allocate rewards at the configured rate (useful for admins to take action on resupplying the pool or activating an inflationary mechanism)

### Governance.sol

Governance.sol implements the logic for decentralized governance over the KeyFi platform and its
relevant contracts (in the meantime: KeyfiToken and RewardPool contracts).

Anybody with 1% of KEYFI delegated to their address can propose a governance action. All proposals are subject to a 3 day voting period, and any address with voting power can vote for or against the proposal. If a majority, and at least 400,000 votes are cast for the proposal, it is queued in the Timelock, and can be implemented after 2 days.

### Timelock.sol

Timelock contract acts as an execution buffer for all the transactions that are approved by the Governance contract.


## Development

Smart contracts are being implemented using Solidity `0.7.0`.

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
