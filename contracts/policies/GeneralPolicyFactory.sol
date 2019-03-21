pragma solidity ^0.4.24;

import "./GeneralPolicy.sol";
import "../interfaces/ICheckRAC.sol";
import "../interfaces/ISecurityToken.sol";
import "../interfaces/IPolicyRegistryAdd.sol";
import "../modules/DataType.sol";

/**
 * @title Proxy for deploying GeneralPolicy instances
 */
contract GeneralPolicyFactory is DataType {

    address public policyRegistry;
    address public racRegistry;

    event CreatePolicy(address indexed _policy, address indexed _securityToken);

    // Constructor
    constructor (address _policyRegistry, address _racRegistry) public
    {
        policyRegistry = _policyRegistry;
        racRegistry = _racRegistry;
    }

    /**
    * @dev modifier to scope access to a single role (uses msg.sender as addr)
    * @param _action the name of the role
    */
    modifier onlyRole(string _action)
    {
        require(racRegistry != address(0), "RAC does not Register");
        require(ICheckRAC(racRegistry).checkRole(msg.sender, stringToBytes32(_action)), "Permission deny");
        _;
    }

    /**
     * @notice deploys the token and adds default policy like the GeneralPolicy.
     * Future versions of the proxy can attach different policy or pass different parameters.
     */
    function create(address _securityToken) external onlyRole('createPolicy') returns (address) {
        address newAddress = new GeneralPolicy(_securityToken, policyRegistry);
        IPolicyRegistryAdd(policyRegistry).addContract(newAddress);
        emit CreatePolicy(newAddress, _securityToken);
        return newAddress;
    }
}
