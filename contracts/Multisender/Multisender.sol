//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Multisender {
    using SafeERC20 for IERC20;

    function multiTransferToken(
        address _token,
        address[] calldata _addresses,
        uint256[] calldata _amounts,
        uint256 _amountSum
    ) payable external
    {
        require(_addresses.length == _amounts.length, "_addresses and _amounts should have same length");

        IERC20 token = IERC20(_token);
        token.safeTransferFrom(msg.sender, address(this), _amountSum);
        for (uint8 i; i < _addresses.length; i++) {
            _amountSum -= _amounts[i];
            token.transfer(_addresses[i], _amounts[i]);
        }
        require(_amountSum == 0, "_amountSum is wrong");
    }

    function multiTransferTokenEqual(
        address _token,
        address[] calldata _addresses,
        uint256 _amount
    ) payable external
    {
        uint256 _amountSum = _amount * _addresses.length;
        IERC20 token = IERC20(_token);
        token.safeTransferFrom(msg.sender, address(this), _amountSum);
        for (uint8 i; i < _addresses.length; i++) {
            token.transfer(_addresses[i], _amount);
        }
    }
}


