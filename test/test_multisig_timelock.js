require('./utils/hooks');
const evm = require('./utils/evm');
const assert = require('assert');
const MultiSigWalletWithTimelock = artifacts.require('MultisigTimelock.sol');

contract('MultisigTimelock', accounts => {
    const defaultOwners = [accounts[0], accounts[1], accounts[2]];

    const newWallet = async (owners = defaultOwners, requires = 2) => {
        return await MultiSigWalletWithTimelock.new(owners, requires);
    };

    const assertOwnersEqual = (owners1, owners2) => {
        if (owners1.length !== owners2.length) {
            return false;
        }

        for (let i = 0; i < owners1.length; i++) {
            if (owners1[i] !== owners2[i]) {
                return false;
            }
        }

        return true;
    };

    // We don't test all the failed cases of INVALID params when create the wallet,
    // just want to make sure the modefier is working.
    it("cant't create wallet with wrong constructor params", async () => {
        await assert.rejects(
            MultiSigWalletWithTimelock.new(defaultOwners, 0),
            /VALID_REQUIREMENT_ERROR/
        );

        await assert.rejects(
            MultiSigWalletWithTimelock.new(defaultOwners, 4),
            /VALID_REQUIREMENT_ERROR/
        );
    });

    it('should be able to deposit ether to wallet', async () => {
        const wallet = await newWallet();
        assert.equal(await web3.eth.getBalance(wallet.address), 0);

        await web3.eth.sendTransaction({
            from: accounts[0],
            to: wallet.address,
            value: 1
        });
        assert.equal(await web3.eth.getBalance(wallet.address), 1);
    });

    const addOwnerTestConfigs = [
        [defaultOwners, 2, accounts[3], true],
        [defaultOwners, 2, accounts[4], true],
        [defaultOwners, 2, accounts[1], false], // already exist owner
        [defaultOwners, 2, '0x0000000000000000000000000000000000000000', false] // invalid owner
    ];

    for (let _i = 0; _i < addOwnerTestConfigs.length; _i++) {
        const testConfig = addOwnerTestConfigs[_i];
        const owners = testConfig[0];
        const requires = testConfig[1];
        const newOwner = testConfig[2];
        const expectedResult = testConfig[3];

        it(`add owner #${_i}`, async () => {
            const wallet = await newWallet(owners, requires);
            assertOwnersEqual(await wallet.getOwners(), owners);
            assert.equal(await wallet.transactionCount(), 0);

            await wallet.submitTransaction(
                wallet.address,
                0,
                wallet.contract.methods.addOwner(newOwner).encodeABI()
            );

            assert.equal(await wallet.transactionCount(), 1); // new tx 0
            assert.equal(await wallet.getConfirmationCount(0), 1); // owner1 confirm
            assert.equal((await wallet.getConfirmations(0))[0], owners[0]);

            assert.equal(await wallet.isConfirmed(0), false);
            assert.equal(await wallet.unlockTimes(0), 0);

            await wallet.confirmTransaction(0, { from: owners[1] });

            assert.equal(await wallet.transactionCount(), 1);
            assert.equal((await wallet.transactions(0)).executed, false);
            assert.equal(await wallet.getConfirmationCount(0), 2); // owner1 & owner2 confirm
            assert.equal(await wallet.isConfirmed(0), true);

            const unlockTime = (await wallet.unlockTimes(0)).toNumber();
            assert.notEqual(unlockTime, 0);

            await assert.rejects(
                evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime - 1),
                /TRANSACTION_NEED_TO_UNLOCK/
            );

            assert.equal((await wallet.transactions(0)).executed, false);

            if (expectedResult) {
                await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
                assert.equal((await wallet.transactions(0)).executed, true);
                assertOwnersEqual(await wallet.getOwners(), owners.concat([newOwner]));
            } else {
                await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
                assert.equal((await wallet.transactions(0)).executed, false);
                assertOwnersEqual(await wallet.getOwners(), owners);
            }
        });
    }

    const removeOwnerTestConfigs = [
        [defaultOwners, 2, accounts[2], true],
        [[accounts[0], accounts[1]], 2, accounts[1], true],
        [defaultOwners, 2, accounts[3], false], // not exist owner
        [[accounts[0]], 1, accounts[0], false] //can not remote the only owner
    ];

    for (let _i = 0; _i < removeOwnerTestConfigs.length; _i++) {
        const testConfig = removeOwnerTestConfigs[_i];
        const owners = testConfig[0];
        const requires = testConfig[1];
        const owner = testConfig[2];
        const expectedResult = testConfig[3];

        it(`remove owner #${_i}`, async () => {
            const wallet = await newWallet(owners, requires);
            assertOwnersEqual(await wallet.getOwners(), owners);
            assert.equal(await wallet.transactionCount(), 0);

            await wallet.submitTransaction(
                wallet.address,
                0,
                wallet.contract.methods.removeOwner(owner).encodeABI()
            );

            let unlockTime = 0;
            if (owners.length > 1) {
                assert.equal(await wallet.transactionCount(), 1); // new tx 0
                assert.equal(await wallet.getConfirmationCount(0), 1); // owner1 confirm
                assert.equal(await wallet.isConfirmed(0), false);
                assert.equal(await wallet.unlockTimes(0), 0);

                await wallet.confirmTransaction(0, { from: owners[1] });

                assert.equal(await wallet.transactionCount(), 1);
                assert.equal((await wallet.transactions(0)).executed, false);
                assert.equal(await wallet.getConfirmationCount(0), 2); // owner1 & owner2 confirm
                assert.equal(await wallet.isConfirmed(0), true);

                unlockTime = (await wallet.unlockTimes(0)).toNumber();
                assert.notEqual(unlockTime, 0);
            } else {
                assert.equal(await wallet.transactionCount(), 1); // new tx 0
                assert.equal(await wallet.getConfirmationCount(0), 1); // owner1 confirm
                assert.equal(await wallet.isConfirmed(0), true);

                unlockTime = (await wallet.unlockTimes(0)).toNumber();
                assert.notEqual(unlockTime, 0);
            }

            await assert.rejects(
                evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime - 1),
                /TRANSACTION_NEED_TO_UNLOCK/
            );

            assert.equal((await wallet.transactions(0)).executed, false);

            if (expectedResult) {
                await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
                assert.equal((await wallet.transactions(0)).executed, true);
                const index = owners.indexOf(owner);
                const oldOwners = Array.from(owners);
                assertOwnersEqual(await wallet.getOwners(), oldOwners.splice(index, 1));
            } else {
                await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
                assert.equal((await wallet.transactions(0)).executed, false);
                assertOwnersEqual(await wallet.getOwners(), owners);
            }
        });
    }


    /*it('hydro normal function call', async () => {
        const wallet = await newWallet();
        const hydro = await Hydro.deployed();

        const oldWithdrawRate = toWei('2');
        const newWithdrawRate = toWei('20');

        await newMarket({
            liquidateRate: toWei('1.2'),
            withdrawRate: oldWithdrawRate,
            assetConfigs: [
                {
                    symbol: 'ETH',
                    name: 'ETH',
                    decimals: 18,
                    oraclePrice: '100',
                    collateralRate: 15000
                },
                {
                    symbol: 'USD',
                    name: 'USD',
                    decimals: 18,
                    oraclePrice: '1',
                    collateralRate: 15000
                }
            ]
        });

        await hydro.transferOwnership(wallet.address);
        assert.equal(await hydro.owner(), wallet.address);

        assert.equal((await hydro.getMarket(0)).withdrawRate, oldWithdrawRate);

        // updateMarket require a time lock
        await wallet.submitTransaction(
            hydro.address,
            0,
            hydro.contract.methods
                .updateMarket(
                    0,
                    toWei('0.01'),
                    toWei('0.01'),
                    toWei('1.2'),
                    newWithdrawRate // <= change freom 2 to 20, withdrawRate
                )
                .encodeABI()
        );

        assert.equal(await wallet.transactionCount(), 1); // new tx 0
        assert.equal(await wallet.getTransactionCount(true, false), 1);
        assert.equal(await wallet.getTransactionCount(false, true), 0);
        assert.equal(await wallet.getConfirmationCount(0), 1); // owner1 confirm
        assert.equal(await wallet.isConfirmed(0), false);
        assert.equal(await wallet.unlockTimes(0), 0);

        await wallet.confirmTransaction(0, { from: defaultOwners[1] });

        assert.equal(await wallet.transactionCount(), 1);
        assert.equal((await wallet.transactions(0)).executed, false);
        assert.equal(await wallet.getConfirmationCount(0), 2); // owner1 & owner2 confirm
        assert.equal(await wallet.isConfirmed(0), true);

        const unlockTime = (await wallet.unlockTimes(0)).toNumber();
        assert.notEqual(unlockTime, 0);

        await assert.rejects(
            evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime - 1),
            /TRANSACTION_NEED_TO_UNLOCK/
        );
        assert.equal((await wallet.transactions(0)).executed, false);

        await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
        assert.equal(await wallet.getTransactionCount(true, false), 0);
        assert.equal(await wallet.getTransactionCount(false, true), 1);
        assert.equal((await wallet.transactions(0)).executed, true);

        assert.equal((await hydro.getMarket(0)).withdrawRate, newWithdrawRate);
    });*/

    it('revokeConfirmation', async () => {
        const wallet = await newWallet();

        // arbitrary tx
        await wallet.submitTransaction(
            wallet.address,
            0,
            wallet.contract.methods
                .removeOwner('0x0000000000000000000000000000000000000000')
                .encodeABI()
        );

        assert.equal(await wallet.getConfirmationCount(0), 1); // owner1 confirmed

        await wallet.revokeConfirmation(0);

        assert.equal(await wallet.getConfirmationCount(0), 0); // nobody confirmed
    });

    it('replace owner', async () => {
        const wallet = await newWallet();
        assertOwnersEqual(await wallet.getOwners(), defaultOwners);

        const newOwner = accounts[5];
        const oldOwner = defaultOwners[1];

        assert.equal(await wallet.isOwner(oldOwner), true);
        assert.equal(await wallet.isOwner(newOwner), false);

        await wallet.submitTransaction(
            wallet.address,
            0,
            wallet.contract.methods.replaceOwner(oldOwner, newOwner).encodeABI())
        

        await wallet.confirmTransaction(0, { from: defaultOwners[1] });
        const unlockTime = (await wallet.unlockTimes(0)).toNumber();

        await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
        assert.equal((await wallet.transactions(0)).executed, true);

        assert.equal(await wallet.isOwner(oldOwner), false);
        assert.equal(await wallet.isOwner(newOwner), true);
    });

    it('changeLockSeconds', async () => {
        const wallet = await newWallet();
        assert.equal(await wallet.lockSeconds(), 259200);

        await wallet.submitTransaction(
            wallet.address,
            0,
            wallet.contract.methods.changeLockSeconds(100).encodeABI()
        );

        await wallet.confirmTransaction(0, { from: defaultOwners[1] });
        const unlockTime = (await wallet.unlockTimes(0)).toNumber();
        await evm.mineAt(async () => await wallet.executeTransaction(0), unlockTime);
        assert.equal((await wallet.transactions(0)).executed, true);

        assert.equal(await wallet.lockSeconds(), 100);
    });
});
