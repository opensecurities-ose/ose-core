pragma solidity ^0.4.24;

import "../interfaces/ICheckRAC.sol";
import "../interfaces/ISecurityToken.sol";
import "../modules/DataType.sol";

contract PublicGeneralPolicy is DataType {

    uint8 public version = 1;
    string public name = "GeneralPolicy";
    address public deployer;
    address public policyRegistry;
    address public racRegistry;

    //from and to timestamps that an investor can transfer tokens respectively
    struct Restriction {
        uint256 fromTime;
        uint256 toTime;
        uint256 expiryTime;
        bool canTransfer;
    }

    // (investor, Restriction)
    mapping (address => Restriction) public whitelist;

    // Emit when investor details get modified related to their whitelisting
    event ModifyWhitelist(
        address _investor,
        uint256 _fromTime,
        uint256 _toTime,
        uint256 _expiryTime,
        bool _canTransfer,
        address _addedBy
    );

    // Constructor
    constructor (address _policyRegistry, address _racRegistry) public
    {
        deployer = msg.sender;
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

    function checkTransfer(bytes32 /* _tranche */, address _from, address _to, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        return _checkWhileList(_from, _to);
    }

    function checkMint(bytes32 /* _tranche */, address _to, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        require(whitelist[_to].expiryTime > now, "account expired");
        return true;
    }

    function checkBurn(bytes32 /* _tranche */, address /* _to */, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        return true;
    }

    function checkChangeTranche(address _owner, bytes32 /* _from */, bytes32 /* _to */, uint256 /* _amount */, bytes /* _data */) public view returns(bool) {
        require(whitelist[_owner].expiryTime > now, "account expired");
        return true;
    }

    /**
    * @notice Adds or removes addresses from the whitelist.
    * @param _investor is the address to whitelist
    * @param _fromTime is the moment when the sale lockup period ends and the investor can freely sell his tokens
    * @param _toTime is the moment when the purchase lockup period ends and the investor can freely purchase tokens from others
    * @param _expiryTime is the moment till investors KYC will be validated. After that investor need to do re-KYC
    * @param _canTransfer is used to know whether the investor is restricted investor or not.
    */
    function modifyWhitelist(
        address _investor,
        uint256 _fromTime,
        uint256 _toTime,
        uint256 _expiryTime,
        bool _canTransfer
    )
    public onlyRole("modifyWhitelist") {
        whitelist[_investor] = Restriction(_fromTime, _toTime, _expiryTime, _canTransfer);
        emit ModifyWhitelist(_investor, _fromTime, _toTime, _expiryTime, _canTransfer, msg.sender);
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
        bool[] _canTransfer
    ) public onlyRole("modifyWhitelist") {
        require(_investors.length == _fromTimes.length, "Mismatched input lengths");
        require(_investors.length == _toTimes.length, "Mismatched input lengths");
        require(_investors.length == _expiryTimes.length, "Mismatched input lengths");
        require(_investors.length == _canTransfer.length, "Mismatched input lengths");

        for (uint256 i = 0; i < _investors.length; i++) {
            modifyWhitelist(_investors[i], _fromTimes[i], _toTimes[i], _expiryTimes[i], _canTransfer[i]);
        }
    }

    function _checkWhileList(address _from, address _to) internal view returns(bool) {
        require(whitelist[_from].canTransfer, "WhileList's canTransfer must be true");
        require(whitelist[_from].fromTime < now, "WhileList's fromTime must be < now");
        require(whitelist[_from].expiryTime > now, "Invest(from) WhileList's expiryTime must be > now");
        require(whitelist[_to].toTime < now, "WhileList's toTime must be < now");
        require(whitelist[_to].expiryTime > now, "Invest(to) WhileList's expiryTime must be > now");
        return true;
    }


    /**
    * @notice Return the Policy details
    */
    function getPolicyDetails(address _investor) public view returns(uint256 _fromTime, uint256 _toTime, uint256 _expiryTime, bool _canTransfer) {
        return (
        whitelist[_investor].fromTime,
        whitelist[_investor].toTime,
        whitelist[_investor].expiryTime,
        whitelist[_investor].canTransfer
        );
    }


}
