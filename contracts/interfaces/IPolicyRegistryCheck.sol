pragma solidity >=0.4.24;

contract IPolicyRegistryCheck {
    function checkContract(address _contractAddress) public view returns(bool);
    function checkContracts(address[] _contractAddresses) public view returns(bool);
}
