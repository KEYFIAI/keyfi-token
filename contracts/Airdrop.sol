// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./Whitelist.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Airdrop is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 token;
    Whitelist whitelist;
    mapping(address => bool) public claimed;
    uint256 airdropAmount;

    event SetAmount(uint256 newAmount);
    event AirdropClaimed(address recipient, uint256 amount);
    event TokensWithdrawn(uint256 withdrawAmount);

    constructor(IERC20 _token, Whitelist _whitelist, uint256 _airdropAmount) {
        token = _token;
        whitelist = _whitelist;
        airdropAmount = _airdropAmount;
    }

    function setAmount(uint256 _newAmount)
        external
        onlyOwner
    {
        airdropAmount = _newAmount;
        emit SetAmount(_newAmount);
    }

    function withdrawTokens(uint256 _amount)
        external
        onlyOwner
    {
        token.safeTransfer(msg.sender, _amount);
        emit TokensWithdrawn(_amount);
    }

    function claim() 
        external
    {
        require(!claimed[msg.sender], "Airdrop::claim:: sender already claimed airdrop");
        require(whitelist.isWhitelisted(msg.sender), "Airdrop::claim:: address is not whitelisted");
        token.safeTransfer(msg.sender, airdropAmount);
        emit AirdropClaimed(msg.sender, airdropAmount);
    }

    function airdropsLeft()
        external 
        view
        returns (uint256)
    {
        return(token.balanceOf(address(this)).div(airdropAmount));   
    }
}