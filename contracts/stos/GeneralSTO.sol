pragma solidity >=0.4.24;

import "../interfaces/ISecurityToken.sol";
import "../libraries/SafeMath.sol";
import "../modules/Pausable.sol";


/**
 * @title STO module for standard maxAmount-offering crowd sale
 */
contract GeneralSTO is Pausable {
    using SafeMath for uint256;

    uint8 public version = 1;
    string public name = "GeneralSTO";
    address public deployer;

    mapping (address => uint256) public fundsRaised;

    // Start time of the STO
    uint256 public startTime;
    // End time of the STO
    uint256 public endTime;
    // Time STO was paused
    uint256 public pausedTime;
    // Number of individual investors
    uint256 public investorCount;
    // Token address of currency used to collect the funds
    address public fundRaiseToken;
    // Wallet Address where ETH or token funds are delivered
    address public fundsReceiver;
    // Final amount of tokens sold
    uint256 public totalTokensSold;


    address public securityToken;
    // How many token units a buyer gets per wei / base unit
    uint256 public rate;
    //How many tokens this STO will be allowed to sell to investors
    uint256 public maxAmount;
    //specific tranche
    bytes32 public tranche;
    // Minimum purchase which is base token to investor
    uint256 public minInvestorAmount;
    // Maximum purchase which is base token to investor
    uint256 public maxInvestorAmount;
    // Maximum investors
    uint256 public maxInvestors;
    // Lock holding period(months) after purchased
    uint256 public lockMonths;

    // Total hold tokens to investors, (investor, amount)
    mapping (address => uint256) public holdTokens;
    // Total pay base tokens to investors, (investor, token, amount)
    mapping (address => mapping (address => uint256)) payBaseTokens;

    /**
    * Event for token purchase logging
    * @param _investor who paid for the tokens and got the tokens
    * @param _amount wei paid for purchase
    * @param _tokens amount of tokens purchased
    */
    event Buy(address indexed _investor, uint256 _amount, uint256 _tokens);

    event ConfigureSTO();

    /**
     * @notice constructor
     * @param _securityToken security token address
     * @param _tranche special tranche
     * @param _paused value: false or true
     * @param _addresses value: [_fundRaiseToken, _fundsReceiver]
     * @param _values  value: [_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]
     */
    constructor (address _securityToken, bytes32 _tranche, bool _paused, address[] _addresses, uint256[] _values) public
    {
        deployer = msg.sender;
        securityToken = _securityToken;
        paused = true;
        owner =  ISecurityToken(_securityToken).owner();
        _configure(_tranche, _paused, _addresses, _values);
    }


    /**
     * @notice Function used to configure the contract variables
     * PARAMS:
     * @param _tranche special tranche
     * @param _paused value: false or true
     * @param _addresses value: [_fundRaiseToken, _fundsReceiver]
     * @param _values  value: [_startTime, _endTime, _maxAmount, _rate, _minInvestorAmount, _maxInvestorAmount, _maxInvestors, _lockMonths]
     */
    function configure(bytes32 _tranche, bool _paused, address[] _addresses, uint256[] _values) public onlyOwner {
        _configure(_tranche, _paused, _addresses, _values);
        emit ConfigureSTO();
    }

    function _configure(bytes32 _tranche, bool _paused, address[] _addresses, uint256[] _values) internal {
        require(_addresses.length == 2, "invalid _addresses");
        require(_values.length == 8, "invalid _values");

        tranche = _tranche;
        paused = _paused;

        // _addresses
        fundRaiseToken = _addresses[0];
        fundsReceiver = _addresses[1];

        // _values
        startTime = _values[0];
        endTime = _values[1];
        maxAmount = _values[2];
        rate = _values[3];
        minInvestorAmount = _values[4];
        maxInvestorAmount = _values[5];
        maxInvestors = _values[6];
        lockMonths = _values[7];

        if(startTime < now ) {
            startTime = now;
        }
        require(rate > 0, "Rate of token should be greater than 0");
        require(fundsReceiver != address(0), "Zero address is not permitted");
        require(endTime > startTime, "Date parameters are not valid");
        require(maxAmount > 0, "MaxAmount should be greater than 0");
    }

    /**
     * @notice Returns funds raised by the STO
     */
    function getRaised(address _token) public view returns (uint256) {
        return fundsRaised[_token];
    }


    /**
      * @notice Low level token purchase ***DO NOT OVERRIDE***
      */
    function buy() public payable  {
        require(fundRaiseToken == address(0), "Must be ETH address");
        _processBuy(msg.sender, msg.value);
        fundsReceiver.transfer(msg.value);
    }

    /**
      * @notice low level token purchase
      * @param _amount Amount of token invested
      */
    function buyWithToken(uint256 _amount) public{
        require(fundRaiseToken != address(0), "Must be not ETH address");
        _processBuy(msg.sender, _amount);
        ISecurityToken(fundRaiseToken).transferFrom(msg.sender, fundsReceiver, _amount);
    }

    /**
    * @notice Checks whether the maxAmount has been reached.
    * @return bool Whether the maxAmount was reached
    */
    function maxAmountReached() public view returns (bool) {
        return totalTokensSold >= maxAmount;
    }

    /**
     * @notice Return the total no. of tokens sold
     */
    function getTokensSold() public view returns (uint256) {
        return totalTokensSold;
    }

    /**
     * @notice Return the STO details
     */
    function getSTODetails() public view
    returns(bytes32 _tranche, uint256 _startTime, uint256 _endTime, uint256 _maxAmount, uint256 _rate, uint256 _investorCount, uint256 _totalTokensSold, address _fundRaiseToken, address _fundsReceiver, uint256 _minInvestorAmount, uint256 _maxInvestorAmount, uint256 _maxInvestors, uint256 _lockMonths) {
        return (
        tranche,
        startTime,
        endTime,
        maxAmount,
        rate,
        investorCount,
        totalTokensSold,
        fundRaiseToken,
        fundsReceiver,
        minInvestorAmount,
        maxInvestorAmount,
        maxInvestors,
        lockMonths
        );
    }

    /**
      * Processing the purchase as well as verify the required validations
      * @param _investor Address performing the token purchase
      * @param _amount Value in wei involved in the purchase
    */
    function _processBuy(address _investor, uint256 _amount) whenNotPaused internal {

        _preValidateBuy(_investor, _amount);
        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(_amount);

        fundsRaised[fundRaiseToken] = fundsRaised[fundRaiseToken].add(_amount);
        totalTokensSold = totalTokensSold.add(tokens);

        if (holdTokens[_investor] == 0) {
            investorCount = investorCount + 1;
        }
        holdTokens[_investor] = holdTokens[_investor].add(tokens);
        payBaseTokens[_investor][fundRaiseToken] = payBaseTokens[_investor][fundRaiseToken].add(_amount);

        require(ISecurityToken(securityToken).mintTranche(tranche, _investor, tokens, 'sto'), "Error in minting the tokens");

        emit Buy(_investor, _amount, tokens);

    }

    /**
    * @notice Validation of an incoming purchase.
      Use require statements to revert state when conditions are not met. Use super to concatenate validations.
    * @param _investor Address performing the token purchase
    * @param _amount Value in wei involved in the purchase
    */
    function _preValidateBuy(address _investor, uint256 _amount) internal view {
        require(_investor != address(0), "Beneficiary address should not be 0x");
        require(_amount != 0, "Amount invested should not be equal to 0");
        require(investorCount < maxInvestors, "investorCount should be equal or less than maxInvestors");
        require(totalTokensSold.add(_getTokenAmount(_amount)) <= maxAmount, "Investment more than maxAmount is not allowed");
        require(_amount >= minInvestorAmount, "Amount invested should be equal or greater than minInvestorAmount");
        require(payBaseTokens[_investor][fundRaiseToken].add(_amount) <= maxInvestorAmount, "Amount invested more than maxAmount is not allowed");
        require(now >= startTime && now <= endTime, "Offering is closed/Not yet started");
    }

    /**
    * @notice Overrides to extend the way in which ether is converted to tokens.
    * @param _amount Value in wei to be converted into tokens
    * @return Number of tokens that can be purchased with the specified _amount
    */
    function _getTokenAmount(uint256 _amount) internal view returns (uint256) {
        return _amount.mul(rate);
    }

}
