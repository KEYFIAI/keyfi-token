// Whitelist.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/*
 * Implements Whitelisting pattern using OpenZeppelin AccessRole
 */
contract Whitelist is AccessControl {
    bytes32 public constant WHITELIST_ADMIN = keccak256("WHITELIST_ADMIN");
    bytes32 public constant WHITELISTED = keccak256("WHITELISTED");

    constructor() public {
        _setRoleAdmin(WHITELIST_ADMIN, WHITELIST_ADMIN);
        _setRoleAdmin(WHITELISTED, WHITELIST_ADMIN);
        _setupRole(WHITELIST_ADMIN, msg.sender);
    }

    modifier onlyWhitelistAdmin {
        require(hasRole(WHITELIST_ADMIN, msg.sender), "Caller is not a whitelist admin");
        _;
    }

    modifier onlyWhitelisted {
        require(hasRole(WHITELISTED, msg.sender), "Caller is not a whitelisted");
        _;
    }

    function addWhitelistAdmin(address account)
        onlyWhitelistAdmin
        public
    {
        grantRole(WHITELIST_ADMIN, account);
    }

    function removeWhitelistAdmin(address account) 
        onlyWhitelistAdmin
        public 
    {
        revokeRole(WHITELIST_ADMIN, account);
    }

    function addWhitelisted(address account) 
        onlyWhitelistAdmin 
        public 
    {
        grantRole(WHITELISTED, account);
    }

    function removeWhitelisted(address account) 
        onlyWhitelistAdmin
        public 
    {
        revokeRole(WHITELISTED, account);
    }

    function isWhitelisted(address account)
        public
        view
        returns (bool)
    {
        return hasRole(WHITELISTED, account);
    }

    function isWhitelistAdmin(address account)
        public
        view
        returns (bool)
    {
        return hasRole(WHITELIST_ADMIN, account);
    }
}
