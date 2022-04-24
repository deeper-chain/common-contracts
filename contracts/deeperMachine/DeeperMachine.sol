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
        mapping(address => uint) subIndexTable;
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

        uint taskId = allTasks.length + 1;

        allTasks.push();

        allTasks[taskId - 1].taskId = taskId;
        allTasks[taskId - 1].maxRunNum = maxRunNum;
        emit TaskPublished(taskId, url, options, maxRunNum);
        console.log('pushed task:', taskId);
    }

    function raceSubIndexForTask(uint taskId) external {
        Task storage theTask = allTasks[taskId - 1];
        require(theTask.taskId == taskId, "Invalid taskId");
        require(!theTask.finished, "Task has been finished");
        require(!theTask.filled, "Task has been filled");
        require(theTask.subIndexTable[msg.sender] == 0, "Address already used");

        uint subIndex = theTask.subTasks.length + 1;

        theTask.subTasks.push();

        theTask.subTasks[subIndex - 1].subIndex = subIndex;
        theTask.subTasks[subIndex - 1].runnerAddr = msg.sender;

        theTask.subIndexTable[msg.sender] = subIndex;

        if (theTask.maxRunNum != 0 && subIndex >= theTask.maxRunNum) {
            theTask.filled = true;
            emit TaskFilled(taskId);
        }

        console.log("pushed subtask:", subIndex);
    }

    function readSubIndexForTask(uint taskId) view external returns (uint){
        Task storage theTask = allTasks[taskId];
        require(theTask.taskId == taskId, "Invalid taskId");
        require(!theTask.finished, "Task has finished");

        return theTask.subIndexTable[msg.sender];
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
