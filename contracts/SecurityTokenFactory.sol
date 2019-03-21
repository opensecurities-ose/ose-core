pragma solidity ^0.4.24;

import "./SecurityToken.sol";
import "./policies/GeneralPolicy.sol";
import "./interfaces/ICheckRAC.sol";
import "./interfaces/IPolicyRegistryAdd.sol";
import "./modules/DataType.sol";

/**
 * @title Proxy for deploying SecurityToken instances
 */
contract SecurityTokenFactory is DataType {

    address public policyRegistry;
    address public racRegistry;

    event CreateST(address indexed _securityToken, string _symbol, uint256 _timestamp);

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
     * @notice create the token and adds default policy like the GeneralPolicy.
     * Future versions of the proxy can attach different policy or pass different parameters.
     */
    function create(
        address _issuer,
        string _name,
        string _symbol,
        uint8 _decimals,
        uint256 _granularity
    ) external onlyRole('createST') returns (address) {
        address newAddress = new SecurityToken(
            _issuer,
            _name,
            _symbol,
            _decimals,
            _granularity
        );

        IPolicyRegistryAdd(policyRegistry).addContract(newAddress);
        emit CreateST(newAddress, _symbol, now);
        return newAddress;
    }
}
