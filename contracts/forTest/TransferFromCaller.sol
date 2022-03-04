//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../WDPR.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TransferFromCaller {
    WDPR public wdpr;
    constructor(WDPR _wdpr){
        wdpr = _wdpr;
    }

    function transferFromTest(uint256 _amountIn, address to) external {
        SafeERC20.safeTransferFrom(IERC20(address(wdpr)), msg.sender, address(to), _amountIn);
    }

}
