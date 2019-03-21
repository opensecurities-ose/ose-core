pragma solidity ^0.4.24;

import "./DataType.sol";
import "./Ownable.sol";

/**
 * @title Role (Role Access Control)
 */
contract Role is Ownable, DataType {

    //(action => operator => permission), action recommend use string(business directive)
    mapping(bytes32=>mapping (address => bool)) roles;

    event AddRole(address _operator, bytes32 _action);
    event RemoveRole(address _operator, bytes32 _action);

    constructor () public {
        roles[stringToBytes32("manageRole")][msg.sender] = true;
    }

    /**
    * @dev modifier to scope access to a single role (uses msg.sender as addr)
    * @param _action the name of the role
    * // reverts
    */
    modifier onlyRole(string _action)
    {
        require(checkRole(msg.sender, stringToBytes32(_action)), "Permission deny");
        _;
    }

    /**
    * @dev modifier to scope access to a single role (uses msg.sender as address)
    * @param _action the name of the role
    */
    modifier onlyOwnerOrRole(string _action)
    {
        if(owner == msg.sender) {
            _;
        } else if (_checkRole(msg.sender, _action)) {
            _;
        } else {
            revert("Permission deny");
        }
    }


    /**
    * check permission
    * @param _operator address of operator
    * @param _action the name of the role
    */
    function checkRole(address _operator, bytes32 _action) public view returns (bool) {
        return roles[_action][_operator];
    }

    function _checkRole(address _operator, string _action) internal view returns (bool) {
        return checkRole(_operator, stringToBytes32(_action));
    }

    /**
    * @dev add a role to an address
    * @param _operator address of operator
    * @param _action the name of the role
    */
    function addRole(address _operator, bytes32 _action) public onlyRole("manageRole") returns (bool) {
        roles[_action][_operator] = true;
        emit AddRole(_operator, _action);
        return true;
    }

    function _addRole(address _operator, string _action) internal returns (bool) {
        roles[stringToBytes32(_action)][_operator] = true;
        return true;
    }

    /**
     * @dev remove a role from an address
     * @param _operator address of operator
     * @param _action the name of the role
     */
    function removeRole(address _operator, bytes32 _action) public onlyRole("manageRole") returns (bool) {
        if(_operator == msg.sender && _action == stringToBytes32("manageRole")) {
            revert("can not remove it if operator there is manageRole");
        }
        roles[_action][_operator] = false;
        emit RemoveRole(_operator, _action);
        return true;
    }


}
