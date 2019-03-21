pragma solidity ^0.4.24;

contract Ownable {
    address public owner;

    event ChangeOwner(address indexed _oldOwner, address indexed _newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeOwner(address _newOwner) public onlyOwner {
        require(_newOwner != address(0));
        emit ChangeOwner(owner, _newOwner);
        owner = _newOwner;
    }

}
