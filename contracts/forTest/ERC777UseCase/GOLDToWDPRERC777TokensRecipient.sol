//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Implementer.sol";

/**
 * @title Simple777Recipient
 * @dev Very simple ERC777 Recipient
 */
contract GOLDToWDPRERC777TokensRecipient is IERC777Recipient, IERC1820Implementer {

    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");
    bytes32 constant private ERC1820_ACCEPT_MAGIC = keccak256(abi.encodePacked("ERC1820_ACCEPT_MAGIC"));

    IERC777 private _token;
    IERC20 private _wdpr;


    event DoneStuff(address operator, address from, address to, uint256 amount, bytes userData, bytes operatorData);

    constructor (address token, address wdpr) public {
        _token = IERC777(token);
        _wdpr = IERC20(wdpr);
    }

    //  account call erc1820.setInterfaceImplementer
    function canImplementInterfaceForAddress(bytes32 interfaceHash, address account) override external view returns (bytes32) {
        if (interfaceHash == TOKENS_RECIPIENT_INTERFACE_HASH) {
            return ERC1820_ACCEPT_MAGIC;
        } else {
            return bytes32(0x00);
        }
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) override external {
        require(msg.sender == address(_token), "Invalid token");

        _wdpr.transferFrom(to, from, amount);

        emit DoneStuff(operator, from, to, amount, userData, operatorData);
    }
}
