pragma solidity 0.5.6;

contract FirstForever {
    string public name = "FirstForever";

    address public owner;
    uint public height; // 创建合约的所在的区块高度
    uint public created; // 创建合约的时间

    /*
      mapping 理解为字典，key => value
      0x81acb7ffda65c125646ac9b8d98cf47c170c01a9 => {1231006505 => "Rebase Team"}
    */
    mapping (address => mapping (uint256 => string)) private records;

   /*
      0x81acb7ffda65c125646ac9b8d98cf47c170c01a9 => 235833
    */
    mapping (address => uint256[]) private categories;

    event Recorded(address _sender, string indexed _text, uint256 indexed _time); // 定义事件

    constructor() public { // 构造函数
        height = block.number; // 合约创建时对应的区块高度
        created = block.timestamp; // 合约创建时间
        owner = msg.sender; // 发送者
    }

    function _addToList(address from, uint256 time) private { // 私有方法
        categories[from].push(time); // mapping 添加一个元素
    }

    function getList()
    public // public是公共方法
    view // view表示这是个查询方法,不改变数据状态
    returns (uint256[] memory)// 返回的数据类型
    {
        return categories[msg.sender];
    }

    function add(string memory text, uint256 time) public { // 公共方法, 外部可以调用
        records[msg.sender][time] = text; // 赋值
        _addToList(msg.sender, time); // 调用方法
        emit Recorded(msg.sender, text, time); // 触发事件
    }

    function get(uint256 time) public view returns(string memory) { // 公共方法, 外部可以调用
        return records[msg.sender][time];
    }

    function getContractAddr() public view returns(address){ // 获得合约地址
        return address(this);
    }
}
