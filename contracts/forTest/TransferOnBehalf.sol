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
    receive() external payable {
    }
    function transferWDPRAsWDPR(uint256 _amountIn, address to) external {
        SafeERC20.safeTransferFrom(IERC20(address(wdpr)), msg.sender, address(this), _amountIn);
        SafeERC20.safeTransferFrom(IERC20(address(wdpr)), address(this), to, _amountIn);
    }

    function transferWDPRAsDPR(uint256 _amountIn, address payable to) external {
        SafeERC20.safeTransferFrom(IERC20(address(wdpr)), msg.sender, address(this), _amountIn);
        wdpr.withdraw(_amountIn);
        (bool success, bytes memory returndata) = to.call{value : _amountIn}("");
        require(success, string(returndata));
    }

    function transferDPRAsWDPR(address to) external payable {
        wdpr.deposit{value : msg.value}();
        SafeERC20.safeTransferFrom(IERC20(address(wdpr)), address(this), to, msg.value);
    }

    function transferDPRAsDPR(address payable to) external payable {
        (bool success, bytes memory returndata) = to.call{value : msg.value}('');
        require(success, string(returndata));
    }
}
