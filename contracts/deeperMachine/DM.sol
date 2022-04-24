//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract DeeperMachine {
    struct Task {
        uint64 currentRunNum;
        uint64 maxRunNum;
    }
    mapping(address => uint64[]) userTask;
    mapping(uint64 => Task) taskInfo;

    event stress_test_task();
    event TaskPublished(uint64 taskId, string url, string options, uint64 maxRunNum);
    event RaceTask(address node);
    
    uint256 public taskPrice = 10 * 10 ** 18;
    uint64 public taskSum = 0;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function publishTask(string calldata url, string calldata options, uint64 maxRunNum) payable external {
        require(msg.value >= taskPrice, "DPR token not enough");

        taskSum = taskSum + 1;
        taskInfo[taskSum].maxRunNum = maxRunNum;
        taskInfo[taskSum].currentRunNum = 0;

        emit TaskPublished(taskSum, url, options, maxRunNum);
    }

    function raceSubIndexForTask(uint64 taskId) external {
        require(taskId <= taskSum, "Invalid taskId");
        require(taskInfo[taskId].maxRunNum > taskInfo[taskId].currentRunNum + 1, "Task has been filled");
        for(uint64 i = 0;i < userTask[msg.sender].length; i++ ) {
            if(userTask[msg.sender][i] == taskId) {
                revert("Address already used");
            }
        }

        userTask[msg.sender].push(taskId);
        taskInfo[taskId].currentRunNum = taskInfo[taskId].currentRunNum + 1;

        emit RaceTask(msg.sender);
    }

    function readSubIndexForTask(uint64 taskId) view external returns (bool){
        for(uint64 i = 0;i < userTask[msg.sender].length; i++ ) {
            if(userTask[msg.sender][i] == taskId) {
                return true;
            }
        }
        return false;
    }

    function stress_test() payable external {
        require(msg.value >= taskPrice, "DPR token not enough");
        emit stress_test_task();
    }

    function withdraw_fund() external {
        require(msg.sender == owner, "nw");
        address payable powner = payable(owner);
        powner.transfer(address(this).balance);
    }

}