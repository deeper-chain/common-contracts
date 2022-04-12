//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DeeperMachine {

    struct SubTask {
        uint subIndex;
        address runnerAddr;
    }

    struct Task {
        uint taskId;
        uint maxRunNum;
        bool filled;
        bool finished;
        SubTask[] subTasks;
    }

    event TaskPublished(uint taskId, string url, string options, uint maxRunNum);
    event TaskFilled(uint taskId);
    event TaskFinished(uint taskId);
    event stress_test_task();

    uint256 public taskPrice = 10 * 10 ** 18;
    Task[] public allTasks;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function publishTask(string calldata url, string calldata options, uint maxRunNum) payable external {
        require(msg.value >= taskPrice, "DPR price not correct");

        uint taskId = allTasks.length;

        allTasks.push();

        allTasks[taskId].taskId = taskId;
        allTasks[taskId].maxRunNum = maxRunNum;
        emit TaskPublished(taskId, url, options, maxRunNum);
        console.log('pushed task:', allTasks.length);
    }

    function raceSubIndexForTask(uint taskId) external {
        Task storage theTask = allTasks[taskId];
        require(theTask.taskId == taskId, "Invalid taskId");
        require(!theTask.finished, "Task has been finished");
        require(!theTask.filled, "Task has been filled");

        uint subIndex = theTask.subTasks.length;

        theTask.subTasks.push(SubTask({subIndex : subIndex, runnerAddr : msg.sender}));

        if(theTask.maxRunNum!=0&&subIndex+1==theTask.maxRunNum){
            theTask.filled = true;
            emit TaskFilled(taskId);
        }
        console.log("pushed subtask:", theTask.subTasks.length);
    }

    function readSubIndexForTask(uint taskId) view external returns (uint){
        Task storage theTask = allTasks[taskId];
        require(theTask.taskId == taskId, "Invalid taskId");
        require(!theTask.finished, "Task has finished");
        SubTask[] storage subTasks = theTask.subTasks;
        for (uint i = 0; i < subTasks.length; i++) {
            if (subTasks[i].runnerAddr == msg.sender) {
                return subTasks[i].subIndex;
            }
        }
        revert("Not found");
    }

    function stress_test() payable external {
        require(msg.value >= taskPrice, "DPR price not correct");
        emit stress_test_task();
    }

    function withdraw_fund() external {
        require(msg.sender == owner, "nw");
        address payable powner = payable(owner);
        powner.transfer(address(this).balance);
    }
}
