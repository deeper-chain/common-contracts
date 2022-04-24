//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract DeeperMachine {
    struct Task {
        uint64 currentRunNum;
        uint64 maxRunNum;
    }
    mapping(address => uint64[]) public userTask;
    mapping(uint64 => Task) public taskInfo;

    event StressTestTask();
    event TaskPublished(uint64 taskId, string url, string options, uint64 maxRunNum);
    event RaceTask(address node);
    
    uint64 public taskSum = 0;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier checkBalance {
        require(msg.value >= 10 * 10 ** 18, "Paying for DPR is not enough");
        _;
    }

    function publishTask(string calldata url, string calldata options, uint64 maxRunNum) external payable checkBalance {
        taskSum = taskSum + 1;
        taskInfo[taskSum].maxRunNum = maxRunNum;
        taskInfo[taskSum].currentRunNum = 0;

        emit TaskPublished(taskSum, url, options, maxRunNum);
    }

    function raceSubIndexForTask(uint64 taskId) external {
        require(taskSum >= taskId, "Invalid taskId");
        require(taskInfo[taskId].maxRunNum > taskInfo[taskId].currentRunNum + 1, "Task has been filled");
        require(!readSubIndexForTask(taskId), "Address already used");

        userTask[msg.sender].push(taskId);
        taskInfo[taskId].currentRunNum = taskInfo[taskId].currentRunNum + 1;

        emit RaceTask(msg.sender);
    }

    function readSubIndexForTask(uint64 taskId) public view returns (bool) {
        for(uint64 i = 0;i < userTask[msg.sender].length; i++ ) {
            if(userTask[msg.sender][i] == taskId) {
                return true;
            }
        }
        return false;
    }

    function stressTest() external payable checkBalance {
        emit StressTestTask();
    }

    function withdrawFund() external {
        require(msg.sender == owner, "nw");
        address payable powner = payable(owner);
        powner.transfer(address(this).balance);
    }

}