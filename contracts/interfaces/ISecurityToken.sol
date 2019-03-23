pragma solidity >=0.4.24;
contract ISecurityToken {
    /**
     * @notice Returns the investor count
     * @return Investor count
     */

    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function registryPolicy(bytes32 _tranche, address _policy) public;
    function owner() public view returns(address);
    function mintTranche(bytes32 _tranche, address _investor, uint256 _value, bytes _data) public returns (bool success);
    function addRole(address _operator, bytes32 _action) public returns (bool);
    function checkRole(address _operator, bytes32 _action) public view returns (bool);

}
