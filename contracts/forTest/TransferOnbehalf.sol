//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../WDPR.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TransferOnBehalf {
    WDPR public wdpr;
    constructor(WDPR _wdpr){
        wdpr = _wdpr;
    }

    function transferWDPRAsWDPR(uint256 _amountIn, address to) external {

    }

    function transferWDPRAsDPR(uint256 _amountIn, address to) external {

    }

    function transferDPRAsWDPR(address to) external payable{

    }

    function transferDPRAsDPR(address to) external payable {

    }
}
