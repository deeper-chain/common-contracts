//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract DeeperMachine {

    event TaskPublished(string url, string options);
    event stress_test_task();

    uint256 public task_price = 10 * 10 ** 18;
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    function publish_task(string calldata url, string calldata options) payable external {
        require(msg.value >= task_price, "DPR price not correct");
        emit TaskPublished(url, options);
    }

    function stress_test() payable external {
        require(msg.value >= task_price, "DPR price not correct");
        emit stress_test_task();
    }

    function withdraw_fund() external {
        require(msg.sender == owner, "nw");
        address payable powner = payable(owner);
        powner.transfer(address(this).balance);
    }
}
