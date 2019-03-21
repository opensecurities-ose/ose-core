pragma solidity ^0.4.24;

import "./SecurityToken.sol";
import "./policies/GeneralPolicy.sol";
import "./interfaces/ICheckRAC.sol";
import "./interfaces/IPolicyRegistryAdd.sol";
import "./modules/DataType.sol";


/**
 * @title Proxy for deploying SecurityToken and GeneralPolicy instances
 */
contract STGFactory is DataType {

    address public policyRegistry;
    address public stoFactory;
    address public racRegistry;

    event CreateSTG(address indexed _securityToken, string _symbol, address indexed _policy);

    // Constructor
    constructor (address _policyRegistry, address _racRegistry, address _stoFactory) public
    {
        policyRegistry = _policyRegistry;
        racRegistry = _racRegistry;
        stoFactory = _stoFactory;
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
    ) external onlyRole("createST") returns (address) {
        address stAddress = new SecurityToken(
            _issuer,
            _name,
            _symbol,
            _decimals,
            _granularity
        );

        address policyAddress = new GeneralPolicy(stAddress, policyRegistry);

        IPolicyRegistryAdd(policyRegistry).addContract(stAddress);
        IPolicyRegistryAdd(policyRegistry).addContract(policyAddress);

        SecurityToken(stAddress).addRole(stoFactory, stringToBytes32("manageRole"));
//        SecurityToken(stAddress).changePolicyRegistry(policyRegistry);
        SecurityToken(stAddress).registryPolicy(stringToBytes32(""), policyAddress);

        emit CreateSTG(stAddress, _symbol, policyAddress);
        return stAddress;
    }

}
