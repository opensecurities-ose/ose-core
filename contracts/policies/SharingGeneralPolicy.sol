pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../interfaces/ISecurityToken.sol";
import "../modules/DataType.sol";

contract SharingGeneralPolicy is DataType {

    uint8 public version = 1;
    string public name = "GeneralPolicy";
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
    // (securityToken, investor, tranche, Restriction)
    mapping (address => mapping (address => mapping (bytes32 => Restriction))) public whitelist;

    // Emit when investor details get modified related to their whitelisting
    event ModifyWhitelist(
        address _securityToken,
        bytes32 _tranche,
        address _investor,
        uint256 _fromTime,
        uint256 _toTime,
        uint256 _expiryTime,
        bool _canTransfer,
        address _addedBy
    );

    // Constructor
    constructor (address _policyRegistry) public
    {
        deployer = msg.sender;
        policyRegistry = _policyRegistry;
    }

    /**
    * @dev modifier to scope access to a single role (uses msg.sender as address)
    * @param _securityToken address of securityToken
    * @param _action the name of the role
    */
    modifier onlyOwnerOrRole(address _securityToken, string _action)
    {
        if(ISecurityToken(_securityToken).owner() == msg.sender) {
            _;
        } else if (ISecurityToken(_securityToken).checkRole(msg.sender, stringToBytes32(_action))) {
            _;
        } else {
            revert("Permission deny");
        }
    }

    function checkTransfer(bytes32 _tranche, address _from, address _to, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        return _checkWhileList(_tranche, _from, _to);
    }

    function checkMint(bytes32 _tranche, address _to, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        require(whitelist[msg.sender][_to][_tranche].expiryTime > now, "account expired");
        return true;
    }

    function checkBurn(bytes32 /* _tranche */, address /* _to */, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        return true;
    }

    function checkChangeTranche(address _owner, bytes32 /* _from */, bytes32 _to, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        require(whitelist[msg.sender][_owner][_to].expiryTime > now, "account expired");
        return true;
    }

    /**
    * @notice Adds or removes addresses from the whitelist.
    * @param _securityToken address of securityToken
    * @param _investor is the address to whitelist
    * @param _times [_fromTime, _toTime, _expiryTime] _fromTime is sell out lock period ends, _toTime is purchase in lock period ends, _expiryTime is account period of validity
    * @param _canTransfer is used to know whether the investor is restricted investor or not
    * @param _tranche The tranche to which the partition of securityToken to invest
    */
    function modifyWhitelist(
        address _securityToken,
        address _investor,
        uint256[] _times,
        bool _canTransfer,
        bytes32 _tranche
    )
    public onlyOwnerOrRole(_securityToken, "modifyWhitelist") {
        uint256 _fromTime = _times[0];
        uint256 _toTime = _times[1];
        uint256 _expiryTime = _times[2];

        whitelist[_securityToken][_investor][_tranche] = Restriction(_fromTime, _toTime, _expiryTime, _canTransfer);
        emit ModifyWhitelist(_securityToken, _tranche, _investor, _fromTime, _toTime, _expiryTime, _canTransfer, msg.sender);
    }

    /**
    * @notice Adds or removes addresses from the whitelist.
    */
    function batchModifyWhitelist(
        address _securityToken,
        address[] _investors,
        uint256[][] _times,
        bool[] _canTransfer,
        bytes32[] _tranches
    ) public onlyOwnerOrRole(_securityToken, "modifyWhitelist") {
        require(_investors.length == _tranches.length, "Mismatched input lengths");
        require(_investors.length == _times.length, "Mismatched input lengths");
        require(_investors.length == _canTransfer.length, "Mismatched input lengths");
        for (uint256 i = 0; i < _investors.length; i++) {
            modifyWhitelist(_securityToken, _investors[i], _times[i], _canTransfer[i], _tranches[i]);
        }
    }

    function _checkWhileList(bytes32 _tranche, address _from, address _to) internal view returns(bool) {
        require(whitelist[msg.sender][_from][_tranche].canTransfer, "WhileList's canTransfer must be true");
        require(whitelist[msg.sender][_from][_tranche].fromTime < now, "WhileList's fromTime must be < now");
        require(whitelist[msg.sender][_from][_tranche].expiryTime > now, "Invest(from) WhileList's expiryTime must be > now");
        require(whitelist[msg.sender][_to][_tranche].toTime < now, "WhileList's toTime must be < now");
        require(whitelist[msg.sender][_to][_tranche].expiryTime > now, "Invest(to) WhileList's expiryTime must be > now");
        return true;
    }


    /**
    * @notice Return the Policy details
    */
    function getPolicyDetails(address _securityToken, address _investor, bytes32 _tranche) public view returns(uint256 _fromTime, uint256 _toTime, uint256 _expiryTime, bool _canTransfer) {
        return (
        whitelist[_securityToken][_investor][_tranche].fromTime,
        whitelist[_securityToken][_investor][_tranche].toTime,
        whitelist[_securityToken][_investor][_tranche].expiryTime,
        whitelist[_securityToken][_investor][_tranche].canTransfer
        );
    }


}
