pragma solidity 0.5.6;

contract VoteContract {

    string public name = "VoteContract";

    address public owner;
    uint public blockNum; // 创建合约的所在的区块高度
    uint public created; // 创建合约的时间
    uint public deadLine; // 截止时间
    uint public balance; // 合约的资金

    // constant 表示常量、常数，不可修改的
    uint constant price = 1 ether; // 1 ether表示 1个eth
    uint constant baseTicket = 10; // 1个eth的兑换比例 换10张票数

    enum voteStatus { inProgress, finished } // 状态

    struct User {
        string nikename;
        uint age;
    }

    event onVote(address _addr, uint _num); // 投票事件

    modifier isAdmin() { // 修改器 // 权限验证
        require(msg.sender == owner, "only owner can do that");
        _;
    }

    mapping(address => uint) tickets; // 用户 => 投票数
    mapping(address => User) Users; // 用户 => 投票数

    constructor() public { // 构造函数
        blockNum = block.number; // 全局变量
        created = block.timestamp; // 合约创建时间
        owner = msg.sender; // 发送者
        deadLine = created + 24 * 60 *60; // 投票默认为1天
    }

    function getContractAddr() public view returns(address){ // 获得合约地址
        return address(this);
    }

    function getTickets(address addr) public view returns(uint){ // 不需要花费gas
        return tickets[addr];
    }

    function register(string memory _nikename, uint _age) public { // 人员登记
        User memory user = User(
            _nikename,
            _age);

        Users[msg.sender] = user;
    }

    function getUser(address _addr) public view returns(string memory, uint) {
        User memory user = Users[_addr];
        return (user.nikename, user.age);
    }

    function getVoteStatus() public view returns(voteStatus) {
        if(block.timestamp < deadLine){
            return voteStatus.inProgress;
        }else {
            return voteStatus.finished;
        }
    }

    function buyTicket(uint num) public payable returns(uint) { // payable 是要转账的
        require(block.timestamp < deadLine, "投票时间已超过");

        uint total = num * price;
        require(msg.value == total, "价格不对");

        balance += msg.value;

        uint _tickets = baseTicket * num;

        address _sender = msg.sender;

        tickets[_sender] += _tickets;

        emit onVote(_sender, num);

        return _tickets;
    }

    function changeDeadLine(uint _time) public isAdmin returns(uint) {
        deadLine = _time;
        return deadLine;
    }
}
