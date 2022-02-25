//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "../WDPR.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AcceptDPRAsWDPR {
    WDPR public wdpr;
    constructor(WDPR _wdpr){
        wdpr = _wdpr;
    }
    function acceptWDPR(uint256 _amountIn) public {
        uint256 oldBalance = wdpr.balanceOf(address(this));
        SafeERC20.safeTransferFrom(IERC20(address(wdpr)), msg.sender, address(this), _amountIn);
        uint256 newBalance = wdpr.balanceOf(address(this));
        console.log("received WDPR: %d", _amountIn);

        require(newBalance == oldBalance + _amountIn, "require newBalance = oldBalance + _amountIn");
    }

    receive() external payable {
        uint256 oldBalance = wdpr.balanceOf(address(this));
        wdpr.deposit{value : msg.value}();
        uint256 newBalance = wdpr.balanceOf(address(this));
        console.log("received DPR as WDPR: %d", msg.value);

        require(newBalance == oldBalance + msg.value, "require newBalance = oldBalance + msg.value");
    }

    function acceptDPR() public payable {
        uint256 oldBalance = wdpr.balanceOf(address(this));
        wdpr.deposit{value : msg.value}();
        uint256 newBalance = wdpr.balanceOf(address(this));
        console.log("received DPR as WDPR: %d", msg.value);

        require(newBalance == oldBalance + msg.value, "require newBalance = oldBalance + msg.value");
    }
}
