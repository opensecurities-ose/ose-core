pragma solidity ^0.4.24;

import "./GeneralSTO.sol";
import "../interfaces/ISecurityToken.sol";
import "../modules/DataType.sol";
import "../modules/Ownable.sol";

/**
 * @title Proxy for deploying STO instances
 */
contract GeneralSTOFactory is Ownable, DataType {

    // Mapping from (securityToken, issuer) to approve create sto
    mapping(address => address) internal allowed;

    event CreateSTO(bytes32 indexed _tranche, address indexed _sto, address indexed _securityToken);

    // Constructor
    constructor () public
    {

    }


    /**
    * @dev Only allow owner of the SecurityToken which there is the permission
    */
    modifier onlyTokenOwner(address _securityToken)
    {
        require(msg.sender == ISecurityToken(_securityToken).owner(), "Permission deny, Only Token owner");
        _;
    }

    /**
     * @notice create the sto.
     * PARAMS:
     * @param _tranche special tranche
     * @param _paused value: false or true
     * @param _addresses value: [_fundRaiseToken, _fundsReceiver]
     * @param _values  value: [_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]
     */
    function create(address _securityToken, bytes32 _tranche, bool _paused, address[] _addresses, uint256[] _values) external onlyTokenOwner(_securityToken) returns (address) {
        require(_addresses.length == 2, "invalid _addresses");
        require(_values.length == 8, "invalid _values");
        address newAddress = new GeneralSTO(_securityToken, _tranche, _paused, _addresses, _values);

        ISecurityToken(_securityToken).addRole(newAddress, stringToBytes32("mint"));
        emit CreateSTO(_tranche, newAddress, _securityToken);
        return newAddress;
    }
}
