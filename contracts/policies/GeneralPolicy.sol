pragma solidity ^0.4.24;

import "../interfaces/IPolicyRegistryCheck.sol";
import "../interfaces/ISecurityToken.sol";
import "../modules/DataType.sol";

contract GeneralPolicy is DataType {

    uint8 public version = 1;
    string public name = "SecurityTokenPolicy";
    address public securityToken;
    address public deployer;
    address public policyRegistry;

    //from and to timestamps that an investor can transfer tokens respectively
    struct Restriction {
        uint256 fromTime;
        uint256 toTime;
        uint256 expiryTime;
        bool canTransfer;
    }


    // An address can only transfer tokens once their corresponding uint256 > block.number
    // (unless allowAllTransfers == true or allowAllWhitelistTransfers == true)
    // (investor, tranche, Restriction)
    mapping (address => mapping (bytes32 => Restriction)) public whitelist;

    // Emit when investor details get modified related to their whitelisting
    event ModifyWhitelist(
        bytes32 _tranche,
        address _investor,
        uint256 _fromTime,
        uint256 _toTime,
        uint256 _expiryTime,
        bool _canTransfer,
        address _addedBy
    );

    // Constructor
    constructor (address _securityToken, address _policyRegistry) public
    {
        deployer = msg.sender;
        policyRegistry = _policyRegistry;
        securityToken = _securityToken;
    }

    /**
    * @dev Only registered securityToken and policy which there is the permission
    */
    modifier onlyAllowed()
    {
        address[] memory contracts = new address[](2);
        contracts[0] = securityToken;
        contracts[1] = this;
        require(IPolicyRegistryCheck(policyRegistry).checkContracts(contracts), "contract must be allowed");
        _;
    }

    /**
    * @dev modifier to scope access to a single role (uses msg.sender as address)
    * @param _action the name of the role
    */
    modifier onlyOwnerOrRole(string _action)
    {
        if(ISecurityToken(securityToken).owner() == msg.sender) {
            _;
        } else if (ISecurityToken(securityToken).checkRole(msg.sender, stringToBytes32(_action))) {
            _;
        } else {
            revert("Permission deny");
        }
    }

    function checkTransfer(bytes32 _tranche, address _from, address _to, uint256 /* _amount */, bytes /* _data */) public onlyAllowed view returns(bool) {
        return _checkWhileList(_tranche, _from, _to);
    }

    function checkMint(bytes32 _tranche, address _to, uint256 /* _amount */, bytes /* _data */) public onlyAllowed view returns(bool) {
        require(whitelist[_to][_tranche].expiryTime > now, "account expired");
        return true;
    }

    function checkBurn(bytes32 /* _tranche */, address /* _to */, uint256 /* _amount */, bytes /* _data */) public onlyAllowed view returns(bool) {
        return true;
    }

    function checkChangeTranche(address _owner, bytes32 /* _from */, bytes32 _to, uint256 /* _amount */, bytes /* _data */) public onlyAllowed view returns(bool) {
        require(whitelist[_owner][_to].expiryTime > now, "account expired");
        return true;
    }

    /**
    * @notice Adds or removes addresses from the whitelist.
    * @param _investor is the address to whitelist
    * @param _fromTime is the moment when the sale lockup period ends and the investor can freely sell his tokens
    * @param _toTime is the moment when the purchase lockup period ends and the investor can freely purchase tokens from others
    * @param _expiryTime is the moment till investors KYC will be validated. After that investor need to do re-KYC
    * @param _canTransfer is used to know whether the investor is restricted investor or not
    * @param _tranche The tranche to which the partition of securityToken to invest
    */
    function modifyWhitelist(
        address _investor,
        uint256 _fromTime,
        uint256 _toTime,
        uint256 _expiryTime,
        bool _canTransfer,
        bytes32 _tranche
    )
    public onlyOwnerOrRole("modifyWhitelist") {
        whitelist[_investor][_tranche] = Restriction(_fromTime, _toTime, _expiryTime, _canTransfer);
        emit ModifyWhitelist(_tranche, _investor, _fromTime, _toTime, _expiryTime, _canTransfer, msg.sender);
    }


    /**
    * @notice Adds or removes addresses from the whitelist.
    * @param _investors List of the addresses to whitelist
    * @param _fromTimes An array of the moment when the sale lockup period ends and the investor can freely sell his tokens
    * @param _toTimes An array of the moment when the purchase lockup period ends and the investor can freely purchase tokens from others
    * @param _expiryTimes An array of the moment till investors KYC will be validated. After that investor need to do re-KYC
    * @param _canTransfer An array of boolean values
    */
    function batchModifyWhitelist(
        address[] _investors,
        uint256[] _fromTimes,
        uint256[] _toTimes,
        uint256[] _expiryTimes,
        bool[] _canTransfer,
        bytes32 _tranche
    ) public onlyOwnerOrRole("modifyWhitelist") {
        require(_investors.length == _fromTimes.length, "Mismatched input lengths");
        require(_investors.length == _toTimes.length, "Mismatched input lengths");
        require(_investors.length == _expiryTimes.length, "Mismatched input lengths");
        require(_investors.length == _canTransfer.length, "Mismatched input length");
        for (uint256 i = 0; i < _investors.length; i++) {
            modifyWhitelist(_investors[i], _fromTimes[i], _toTimes[i], _expiryTimes[i], _canTransfer[i], _tranche);
        }
    }

    function _checkWhileList(bytes32 _tranche, address _from, address _to) internal view returns(bool) {
        require(whitelist[_from][_tranche].canTransfer, "WhileList's canTransfer must be true");
        require(whitelist[_from][_tranche].fromTime < now, "WhileList's fromTime must be < now");
        require(whitelist[_from][_tranche].expiryTime > now, "Invest(from) WhileList's expiryTime must be > now");
        require(whitelist[_to][_tranche].toTime < now, "WhileList's toTime must be < now");
        require(whitelist[_to][_tranche].expiryTime > now, "Invest(to) WhileList's expiryTime must be > now");
        return true;
    }


    /**
    * @notice Return the Policy details
    */
    function getPolicyDetails(address _investor, bytes32 _tranche) public view returns(uint256 _fromTime, uint256 _toTime, uint256 _expiryTime, bool _canTransfer) {
        return (
        whitelist[_investor][_tranche].fromTime,
        whitelist[_investor][_tranche].toTime,
        whitelist[_investor][_tranche].expiryTime,
        whitelist[_investor][_tranche].canTransfer
        );
    }


}
