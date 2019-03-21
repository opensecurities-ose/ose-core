pragma solidity ^0.4.24;

import "./modules/DataType.sol";
/**
 * @title RAC (Role Access Control)
 */
contract RAC is DataType {

    //(action => operator => permission), action recommend use string(business directive)
    mapping(bytes32=>mapping (address => bool)) roles;
    //(action => operator => permission), action recommend use string(business directive)
    mapping(bytes32=>mapping (address => bool)) privateRoles;

    event AddRole(address _operator, bytes32 _action);
    event RemoveRole(address _operator, bytes32 _action);

    event AddPrivateRole(address _operator, bytes32 _action);
    event RemovePrivateRole(address _operator, bytes32 _action);

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
    * check permission
    * @param _operator address of operator
    * @param _action the name of the role
    */
    function checkRole(address _operator, bytes32 _action) public view returns (bool) {
        return roles[_action][_operator];
    }

    /**
    * @dev add a role to an address
    * @param _operator address of operator
    * @param _action the name of the role
    */
    function addRole(address _operator, bytes32 _action) public onlyRole("manageRole") {
        roles[_action][_operator] = true;
        emit AddRole(_operator, _action);
    }

    /**
    * @dev add roles to an address
    * @param _operator address of operator
    * @param _actions the name of the role
    */
    function batchAddRole(address _operator, bytes32[] _actions) public onlyRole("manageRole") {
        for(uint256 i; i<_actions.length; i++) {
            addRole(_operator, _actions[i]);
        }
    }

    /**
     * @dev remove a role from an address
     * @param _operator address of operator
     * @param _action the name of the role
     */
    function removeRole(address _operator, bytes32 _action) public onlyRole("manageRole") {
        if(_operator == msg.sender && _action == stringToBytes32("manageRole")) {
            revert("can not remove it if operator there is manageRole");
        }
        roles[_action][_operator] = false;
        emit RemoveRole(_operator, _action);
    }

    /**
     * @dev remove roles from an address
     * @param _operator address of operator
     * @param _actions the name of the role
     */
    function batchRemoveRole(address _operator, bytes32[] _actions) public onlyRole("manageRole") {
        for(uint256 i; i<_actions.length; i++) {
            removeRole(_operator, _actions[i]);
        }
    }

    /**
    * check permission
    * @param _action the name of the role
    */
    function checkPrivateRole(bytes32 _action) public view returns (bool) {
        return privateRoles[_action][msg.sender];
    }

    /**
    * @dev add a private role to an address
    * @param _action the name of the role
    */
    function addPrivateRole(bytes32 _action) public {
        privateRoles[_action][msg.sender] = true;
        emit AddPrivateRole(msg.sender, _action);
    }

    /**
    * @dev add private role to an address
    * @param _actions the name of the role
    */
    function batchAddPrivateRole(bytes32 _actions) public {
        for(uint256 i; i<_actions.length; i++) {
            addPrivateRole(_actions[i]);
        }
    }

    /**
    * @dev remove a private role to an address
    * @param _action the name of the role
    */
    function removePrivateRole(bytes32 _action) public {
        privateRoles[_action][msg.sender] = false;
        emit RemovePrivateRole(msg.sender, _action);
    }

    /**
    * @dev remove private role to an address
    * @param _actions the name of the role
    */
    function batchRemovePrivateRole(bytes32 _actions) public {
        for(uint256 i; i<_actions.length; i++) {
            removePrivateRole(_actions[i]);
        }
    }

}
