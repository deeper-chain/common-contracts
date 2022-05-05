//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract DeeperMachine {
    struct Task {
        uint64 currentRunNum;
        uint64 maxRunNum;
        uint64 startTime;
    }

    mapping(address => mapping(uint64 => bool)) public userTask;
    mapping(address => mapping(uint64 => bool)) public userTaskCompleted;

    mapping(uint64 => Task) public taskInfo;

    mapping(address => mapping(uint64 => uint64)) public userDayIncome;
    mapping(address => uint64) public userSettledDay;

    event StressTestTask();
    event TaskPublished(uint64 taskId, string url, string options, uint64 maxRunNum);
    event RaceTask(address node, uint64 taskId);

    uint64 public taskSum = 0;
    address public owner;

    uint64 public price = 10 ether;
    uint64 public raceTimeout = 20 minutes;
    uint64 public completeTimeout = 48 hours;
    uint64 public startDay;

    constructor() {
        owner = msg.sender;
        startDay = uint64(block.timestamp / 1 days);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "not owner address");
        _;
    }

    modifier checkBalance {
        require(msg.value >= price, "Paying for DPR is not enough");
        _;
    }

    function implementationVersion() external pure virtual returns (string memory) {
        return "1.0.1";
    }

    function setPrice(uint64 _price) external onlyOwner {
        price = _price;
    }

    function setRaceTimeout(uint64 _raceTimeout) external onlyOwner {
        raceTimeout = _raceTimeout;
    }

    function setCompleteTimeout(uint64 _completeTimeout) external onlyOwner {
        completeTimeout = _completeTimeout;
    }

    function publishTask(string calldata url, string calldata options, uint64 maxRunNum) external payable checkBalance {
        taskSum = taskSum + 1;
        taskInfo[taskSum].maxRunNum = maxRunNum;
        taskInfo[taskSum].currentRunNum = 0;
        taskInfo[taskSum].startTime = uint64(block.timestamp);

        emit TaskPublished(taskSum, url, options, maxRunNum);
    }

    function raceSubIndexForTask(uint64 taskId) external {
        require(taskSum >= taskId, "Invalid taskId");
        require(taskInfo[taskId].maxRunNum >= taskInfo[taskId].currentRunNum + 1, "Task has been filled");
        require(taskInfo[taskId].startTime + raceTimeout >= block.timestamp, "Task race has been expired");

        require(!readSubIndexForTask(taskId), "Address already used");

        userTask[msg.sender][taskId] = true;
        taskInfo[taskId].currentRunNum = taskInfo[taskId].currentRunNum + 1;

        emit RaceTask(msg.sender, taskId);
    }

    function completeSubIndexForTask(uint64 taskId) external {
        require(userTask[msg.sender][taskId], "Invalid taskId or task not raced");
        require(!userTaskCompleted[msg.sender][taskId], "Sub task has been completed");
        require(taskInfo[taskId].startTime + completeTimeout >= block.timestamp, "Task has been expired");

        userTaskCompleted[msg.sender][taskId] = true;

        uint64 day = uint64(block.timestamp / 1 days);
        userDayIncome[msg.sender][day] += price / taskInfo[taskId].maxRunNum;
    }

    function calcEarnings() public view returns (uint64){
        uint64 day = uint64(block.timestamp / 1 days);
        uint64 amount = 0;
        uint64 settledDay = userSettledDay[msg.sender];
        if (settledDay == 0) {
            settledDay = startDay;
        }
        for (uint64 p = settledDay + 1; p <= day - 1; p++) {
            amount += userDayIncome[msg.sender][p];
        }
        return amount;
    }

    function withdrawEarnings() external {
        uint64 amount = calcEarnings();
        uint64 day = uint64(block.timestamp / 1 days);
        userSettledDay[msg.sender] = day - 1;

        (bool success,) = msg.sender.call{value : amount}("");
        require(success, "DPR transfer failed");
    }

    function readSubIndexForTask(uint64 taskId) public view returns (bool) {
        return userTask[msg.sender][taskId];
    }

    function stressTest() external payable checkBalance {
        emit StressTestTask();
    }

    function withdrawFund() external onlyOwner {
        address payable powner = payable(owner);
        powner.transfer(address(this).balance);
    }
}
