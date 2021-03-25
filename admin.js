const Web3 = require('web3')
const ethers = require('ethers')
const wallet = ethers.Wallet.fromMnemonic(process.env.SK_DEPLOY_WALLET_KEY)

// const provider = new Web3("https://mainnet.infura.io/v3/" + process.env.SK_DEPLOY_INFURA_KEY)
// const provider = new Web3("https://ropsten.infura.io/v3/" + process.env.SK_DEPLOY_INFURA_KEY)
const provider = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545')
// const provider = new Web3('https://bsc-dataseed1.binance.org')

const abi0 = require('./build/contracts/KeyfiToken.json')
const abi = require('./build/contracts/RewardPool.json')
const KEYFI = '0x2bA8E0794B99B9Fe7236FD25aE943563F1F1f50a'
const rewardContract = '0xE93e1c89923e5D5025565064986E68509AB13487'

// const amount = '100000000000000000000000' // 100k
const amount = '50000000000000000000000' // 50k

approve = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let contract = new web3.eth.Contract(abi0.abi, KEYFI)
			let result = await contract.methods.approve(rewardContract, amount).send({from: wallet.address, gas: 1000000})
			console.log(result)
			resolve(result)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

transfer = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let keyfi = new web3.eth.Contract(abi0.abi, KEYFI)
			let minted = await keyfi.methods.transfer(rewardContract, '800000000000000000000000').send({from: wallet.address, gas: 1000000})
			resolve(minted)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

setMinter = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let keyfi = new web3.eth.Contract(abi0.abi, KEYFI)
			let minted = await keyfi.methods.setMinter('0xEFcE31c1f23422a21fdE99f65bB091601eE54Fd6').send({from: wallet.address, gas: 1000000})
			resolve(minted)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

mint = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let keyfi = new web3.eth.Contract(abi0.abi, KEYFI)
			let minted = await keyfi.methods.mint('0x2a9aC1Cab57d80e5E3c4574330863d54Ae311C68', '1000000000000000000000000').send({from: wallet.address, gas: 1000000})
			resolve(minted)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}


// ** REWARD CONTRACT INTERFACE **

// enable staking for a token
addToken = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.addStakingToken(33, KEYFI, 100).send({from: wallet.address, gas: 1000000})
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// check staking tokens added
count = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.stakingTokensCount().call({from: wallet.address})
			resolve(admin)
			console.log(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// change token allocation points / deposit fee points
set = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.set(KEYFI, 50, 200).send({from: wallet.address, gas: 420000})
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// check if staking enabled for token
check = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.isStakingToken(UNI).call({from: wallet.address})
			console.log(admin)
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// update checkpoint
update = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.massUpdateTokens().send({from: wallet.address, gas: 420000})
			resolve(admin)
			console.log(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

deposit = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.deposit(KEYFI, amount).send({from: wallet.address, gas: 1000000})
			console.log(admin)
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// check staked tokens balance
staked = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.getBalance(KEYFI).call({from: wallet.address})
			console.log(admin)
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// check rewards balance
rewards = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.pendingReward(KEYFI, wallet.address).call({from: wallet.address})
			console.log(admin)
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

withdraw = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.withdraw(KEYFI, amount).send({from: wallet.address, gas: 420000})
			console.log(admin)
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

withdrawRewards = async () => {
	return new Promise( async (resolve, reject) => {
		try {
			let web3 = provider
			await web3.eth.accounts.wallet.add(wallet)
			let reward = new web3.eth.Contract(abi.abi, rewardContract)
			let admin = await reward.methods.withdrawRewards(KEYFI).send({from: wallet.address, gas: 1000000})
			console.log(admin)
			resolve(admin)
		} catch (e) {
			console.error(e)
			reject(e)
		}
	})
}

// approve()

// transfer()

// setMinter()

// mint()

// addToken()

// count()

// set()

// check()

// update()

// deposit()

// staked()

// rewards()

// withdraw()

withdrawRewards()
