pragma solidity ^0.4.24;

import "./interfaces/ICheckRAC.sol";
import "./modules/DataType.sol";

contract PolicyRegistry is DataType {

    address public racRegistry;

    // (sender/contract address, value(true or false))
    mapping (address => bool) public contractAddresses;

    bool public paused = false;

    event Pause();
    event Unpause();

    // Emit when added contract
    event AddContract(address indexed _contractAddress);
    // Emit when remove contract
    event RemoveContract(address indexed _contractAddress);

    // Constructor
    constructor (address _racRegistry) public
    {
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
     * @notice triggers stopped state
     */
    function pause() public onlyRole("pausePolicyRegistry")  {
        require(!paused, "PolicyRegistry is paused");
        paused = true;
        emit Pause();
    }

    /**
    * @notice returns to normal state
    */
    function unpause() public onlyRole("pausePolicyRegistry")  {
        require(paused, "PolicyRegistry is not paused");
        paused = false;
        emit Unpause();
    }

    /**
     * @notice get contract status
     * @param _contractAddress is the address of contract
     */
    function getContract(address _contractAddress) public view returns(bool) {
        return contractAddresses[_contractAddress];
    }

    /**
     * @notice check contract status
     * @param _contractAddress is the address of contract
     */
    function checkContract(address _contractAddress) public view returns(bool) {
        return (!paused && contractAddresses[_contractAddress]);
    }

    /**
    * @notice check contracts status
    * @param _contractAddresses are the address of contracts
    */
    function checkContracts(address[] _contractAddresses) public view returns(bool) {
        if(paused) {
            return false;
        }
        for(uint256 i=0; i<_contractAddresses.length; i++) {
            if (!contractAddresses[_contractAddresses[i]]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice add contract
     * @param _contractAddress address of the contract
     */
    function addContract(address _contractAddress) public onlyRole("manageContract") returns(bool) {
        require(!paused, "PolicyRegistry is paused");
        contractAddresses[_contractAddress] = true;
        emit AddContract(_contractAddress);
        return true;
    }

    /**
    * @dev add contracts
    * @param _contractAddresses are the address of contracts
    */
    function batchAddContract(address[] _contractAddresses) public onlyRole("manageContract") returns(bool) {
        require(!paused, "PolicyRegistry is paused");
        for(uint256 i; i<_contractAddresses.length; i++) {
            contractAddresses[_contractAddresses[i]] = true;
            emit AddContract(_contractAddresses[i]);
        }
    }

    /**
     * @notice remove contract
     * @param _contractAddress is the address of contract
     */
    function removeContract(address _contractAddress) public onlyRole("manageContract") returns(bool) {
        require(!paused, "PolicyRegistry is paused");
        contractAddresses[_contractAddress] = false;
        emit RemoveContract(_contractAddress);
        return true;
    }

    /**
    * @dev remove contracts
    * @param _contractAddresses are the address of contracts
    */
    function batchRemoveContract(address[] _contractAddresses) public onlyRole("manageContract") returns(bool) {
        require(!paused, "PolicyRegistry is paused");
        for(uint256 i; i<_contractAddresses.length; i++) {
            contractAddresses[_contractAddresses[i]] = false;
            emit RemoveContract(_contractAddresses[i]);
        }
    }

}
