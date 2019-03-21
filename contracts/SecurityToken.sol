pragma solidity ^0.4.24;


import "./interfaces/IPolicy.sol";
import "./libraries/SafeMath.sol";
import "./modules/Role.sol";
import "./interfaces/IERC20.sol";

/**
* @title Security Token contract
* @notice  ERC20 and ERC1410 are supported:
* @notice - Transfers are restricted; need to check policy
*/
contract SecurityToken is Role,IERC20 {
    using SafeMath for uint256;

    // Used to hold the number version data
    uint8 public version = 1;

    string public name;
    string public symbol;
    uint256 public totalSupply;
    uint8 public decimals;
    uint256 public granularity;
    address public deployer;

    mapping (bytes32 => uint256) trancheTotalSupply;

    bytes32[] tranches;

    // Mapping from investor to aggregated balance across all investor token sets
    // mapping (address investor => uint256 amount) balances;
    mapping (address => uint256) balances;

    // Mapping from investor to tranche balance token
    // mapping (address investor => mapping (bytes32 tranche => uint256 amount)) trancheBalances;
    mapping (address => mapping (bytes32 => uint256)) trancheBalances;

    // Mapping from (investor, tranche, operator) to approved status
    mapping (address => mapping (bytes32 => mapping (address => bool))) trancheApprovals;

    // Mapping from investor to their tranches
    mapping (address => bytes32[]) investorTranches;

    // Mapping from investor to default tranches
    mapping (address => bytes32) investorDefaultTranche;

    mapping (bytes32 => address) policies;

    // Mapping from (investor, tranche, operator, amount) to approve transfer
    mapping(address => mapping (bytes32 => mapping(address => uint256))) internal allowedTransfer;


    struct InvestorData {
        // List of investors who's balance is greater than 0
        mapping (address => bool) investorListed;
        // List of token holders
        address[] investors;
        // Total number of non-zero token holders
        uint256 investorCount;
    }

    mapping (bytes32 => InvestorData) internal investorData;


    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event ApprovalTransfer(bytes32 indexed _tranche, address indexed _owner, address indexed _operator, uint256 _value);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// @notice This emits on any successful call to `mint`
    event Mint(bytes32 indexed _tranche, address indexed _owner, uint256 _amount, bytes _data);

    /// @notice This emits on any successful call to `burn`
    event Burnt(bytes32 indexed _tranche, address indexed _owner, uint256 _amount, bytes _data);

    /// @notice This emits on any successful transfer or minting of mocks
    event TransferTranche(bytes32 _tranche, address indexed _operator, address indexed _from, address indexed _to, uint256 _amount, bytes _data);

    // Emit when the granularity get changed
    event ChangeGranularity(uint256 _old, uint256 _new);

    // Emit when the defaultTranche get changed
    event ChangeInvestorDefaultTranche(address _owner, bytes32 _old, bytes32 _new);

    // Emit when Module get removed from the securityToken
    event RegistryPolicy(bytes32 _tranche, address _policy);

    event ForceTransfer(bytes32 _tranche, address indexed _operator, address indexed _from, address indexed _to, uint256 _value, bool _verifyTransfer, bytes _data);
    event ForceBurn(bytes32 _tranche, address indexed _operator, address indexed _from, uint256 _value, bool _verifyTransfer, bytes _data);
    event ChangeTranche(address _owner, bytes32 _from, bytes32 _to, uint256 _value, bytes _data);


    modifier checkGranularity(uint256 _value) {
        require(_value % granularity == 0, "Invalid granularity");
        _;
    }

    modifier checkPolicy(bytes32 _tranche) {
        require(policies[_tranche] != address(0), "Invalid Policy of the tranche");
        _;
    }

    /**
     * @notice Constructor
     * @param _owner address of issuer
     * @param _name Name of the SecurityToken
     * @param _symbol Symbol of the Token
     * @param _decimals Decimals for the securityToken
     * @param _granularity granular level of the token
     */
    constructor (
        address _owner,
        string _name,
        string _symbol,
        uint8 _decimals,
        uint256 _granularity
    )
    public
    {
        deployer = msg.sender;
        owner = _owner;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        granularity = _granularity;

        _addRole(owner, "manageRole");
        _addRole(deployer, "manageRole");
        _addRole(deployer, "configure");
    }

    /**
    * @notice get a policy attached to the SecurityToken
    * @param _tranche address of policy
    */
    function getPolicy(bytes32 _tranche) public view  returns (address) {
        return policies[_tranche];
    }

    function getInvestorDefaultTranche(address _owner) public view returns (bytes32) {
        return investorDefaultTranche[_owner];
    }

    /**
  * @notice Counts the trancheTotalSupply associated with a specific tranche
  * @param _tranche The tranche for which to query the TotalSupply
  * @return The number of tranche, possibly zero
  */
    function getTrancheTotalSupply(bytes32 _tranche) public view returns (uint256) {
        return trancheTotalSupply[_tranche];
    }

    /**
     * @notice Counts the sum of all tranche balances assigned to an owner
     * @param _owner An address for whom to query the balance
     * @return The number of mocks owned by `_owner`, possibly zero
     */
    function balanceOf(address _owner) public view returns (uint256) {
        return trancheBalances[_owner][investorDefaultTranche[_owner]];
    }

    /**
     * @notice Counts the sum of all tranche balances assigned to an owner
     * @param _owner An address for whom to query the balance
     * @return The number of mocks owned by `_owner`, possibly zero
     */
    function balanceOfAll(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    /**
     * @notice Counts the balance associated with a specific tranche assigned to an owner
     * @param _tranche The tranche for which to query the balance
     * @param _owner An address for whom to query the balance
     * @return The number of mocks owned by `_owner` with the metadata associated with `_tranche`, possibly zero
     */
    function balanceOfTranche(bytes32 _tranche, address _owner) public view returns (uint256) {
        return trancheBalances[_owner][_tranche];
    }

    /**
     * @notice List of investors
     * @param _start Position of investor to start iteration from
     * @param _end Position of investor to stop iteration at
     * @return list of investors
     */
    function iterateInvestors(bytes32 _tranche, uint256 _start, uint256 _end) public view returns(address[]) {
        require(_end <= investorData[_tranche].investors.length, "Invalid end");
        address[] memory investors = new address[](_end.sub(_start));
        uint256 index = 0;
        for (uint256 i = _start; i < _end; i++) {
            investors[index] = investorData[_tranche].investors[i];
            index++;
        }
        return investors;
    }

    /**
     * @notice Returns the investor count
     * @return Investor count
     */
    function getInvestorCount(bytes32 _tranche) public view returns(uint256) {
        return investorData[_tranche].investorCount;
    }

    // @notice Enables caller to determine the count of tranches owned by an address
    // @param _owner An address over which to enumerate tranches
    // @return The number of tranches owned by an `_owner`
    function tranchesOf(address _owner) public view returns (bytes32[]) {
        return investorTranches[_owner];
    }

    /**
    * @notice Removes a policy attached to the SecurityToken
    * @param _policy address of policy
    */
    function registryPolicy(bytes32 _tranche, address _policy) public onlyOwnerOrRole("configure") {
        policies[_tranche] = _policy;
        emit RegistryPolicy(_tranche, _policy);
    }

    /**
    * @notice Allows owner to change token granularity
    * @param _granularity granularity level of the token
    */
    function changeGranularity(uint256 _granularity) public onlyOwnerOrRole("configure") {
        require(_granularity != 0, "Invalid granularity");
        emit ChangeGranularity(granularity, _granularity);
        granularity = _granularity;
    }

    /**
    * @notice Allows owner to change default tranche for erc20
    */
    function changeInvestorDefaultTranche(address _owner, bytes32 _tranche) public {
        emit ChangeInvestorDefaultTranche(_owner, investorDefaultTranche[_owner], _tranche);
        investorDefaultTranche[_owner] = _tranche;
    }

    /**
     * @notice Overloaded version of the transfer function
     * @param _to receiver of transfer
     * @param _value value of transfer
     * @return bool success
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_transferTranche(investorDefaultTranche[msg.sender], _to, _value, ""));
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferTranche(bytes32 _tranche, address _to, uint256 _value, bytes _data) public returns (bool success) {
        require(_transferTranche(_tranche, _to, _value, _data));
        emit TransferTranche(_tranche, address(0), msg.sender, _to,  _value, _data);
        return true;
    }

    /**
     * @notice Overloaded version of the transfer function
     * @param _to receiver of transfer
     * @param _values value of transfer
     * @return bool success
     */
    function batchTransferTranche(bytes32 _tranche, address[] _to, uint256[] _values, bytes _data) public returns (bool success) {
        require(_to.length == _to.length, "Incorrect inputs");
        for (uint256 i = 0; i < _to.length; i++) {
            transferTranche(_tranche, _to[i], _values[i], _data);
        }
        return true;
    }

    /**
     * @notice Transfers the ownership of mocks from a specified tranche from one address to another address
     * @param _tranche The tranche from which to transfer mocks
     * @param _to The address to which to transfer mocks to
     * @param _value The amount of mocks to transfer from `_tranche`
     * @param _data Additional data attached to the transfer of mocks
     * @return bool success
     */
    function _transferTranche(bytes32 _tranche, address _to, uint256 _value, bytes _data) internal returns (bool success) {
        require(_checkTransfer(_tranche, msg.sender, _to, _value, _data), "Transfer invalid");
        require(_to != address(0));
        require(_value <= trancheBalances[msg.sender][_tranche]);

        trancheBalances[msg.sender][_tranche] = trancheBalances[msg.sender][_tranche].sub(_value);
        trancheBalances[_to][_tranche] = trancheBalances[_to][_tranche].add(_value);
        return true;
    }

    /**
     * @notice Overloaded version of the transferFrom function
     * @param _from sender of transfer
     * @param _to receiver of transfer
     * @param _value value of transfer
     * @return bool success
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool) {
        require(_transferFromTranche(investorDefaultTranche[_from], _from, _to, _value, ""));
        emit Transfer(_from, _to, _value);
        return true;
    }

    function transferFromTranche(bytes32 _tranche, address _from, address _to, uint256 _value, bytes _data) public returns (bool success) {
        require(_transferFromTranche(_tranche, _from, _to, _value, _data));
        emit TransferTranche(_tranche, msg.sender, _from, _to,  _value, _data);
        return true;
    }

    /**
     * @notice Overloaded version of the transferFrom function
     * @param _tranche The tranche from which to transfer mocks
     * @param _from sender of transfer
     * @param _to receiver of transfer
     * @param _value value of transfer
     * @param _data data to indicate validation
     * @return bool success
     */
    function _transferFromTranche(bytes32 _tranche, address _from, address _to, uint256 _value, bytes _data) internal returns(bool success) {
        require(_checkTransfer(_tranche, _from, _to, _value, _data), "checkTransfer fail");
        require(_to != address(0), "to address should not be zero");
        require(_value <= trancheBalances[_from][_tranche], "balances is not enough");
        require(_value <= allowedTransfer[_from][_tranche][msg.sender], "allowed is not enough");

        trancheBalances[_from][_tranche] = trancheBalances[_from][_tranche].sub(_value);
        trancheBalances[_to][_tranche] = trancheBalances[_to][_tranche].add(_value);
        return true;
    }

    /**
     * @notice mints new mocks and assigns them to the target _investor.
     * @param _investor Address where the minted mocks will be delivered
     * @param _value Number of mocks be minted
     * @return bool success
     */
    function mint(address _investor, uint256 _value) public onlyOwnerOrRole("mint") returns (bool success) {
        return mintTranche(investorDefaultTranche[_investor], _investor, _value, '');
    }

    /**
     * @notice Mints new tokens and assigns them to the target _investor.
     * @dev Can only be called by the owner or STO attached to the token.
     * @param _investors A list of addresses to whom the minted tokens will be dilivered
     * @param _values A list of number of tokens get minted and transfer to corresponding address of the investor from _investor[] list
     * @return success
     */
    function batchMint(address[] _investors, uint256[] _values) public onlyOwnerOrRole("mint") returns (bool success) {
        require(_investors.length == _values.length, "Incorrect inputs");
        for (uint256 i = 0; i < _investors.length; i++) {
            mint(_investors[i], _values[i]);
        }
        return true;
    }

    /**
     * @notice mints new mocks and assigns them to the target _investor.
     * @param _tranche The tranche to allocate the increase in balance
     * @param _investor Address where the minted mocks will be delivered
     * @param _value Number of mocks be minted
     * @param _data data to indicate validation
     * @return bool success
     */
    function mintTranche(bytes32 _tranche, address _investor, uint256 _value, bytes _data) public onlyOwnerOrRole("mint")  returns (bool success) {
        require(_investor != address(0), "Investor is 0");
        require(_checkMint(_tranche, _investor, _value, _data), "checkMint fail");
        totalSupply = totalSupply.add(_value);
        trancheTotalSupply[_tranche] = trancheTotalSupply[_tranche].add(_value);
        trancheBalances[_investor][_tranche] = trancheBalances[_investor][_tranche].add(_value);
        emit Mint(_tranche, _investor, _value, _data);
        return true;
    }

    /**
     * @notice Mints new tokens and assigns them to the target _investor.
     * @dev Can only be called by the owner or STO attached to the token.
     * @param _investors A list of addresses to whom the minted tokens will be dilivered
     * @param _values A list of number of tokens get minted and transfer to corresponding address of the investor from _investor[] list
     * @return success
     */
    function batchMintTranche(bytes32 _tranche, address[] _investors, uint256[] _values, bytes _data) public onlyOwnerOrRole("mint") returns (bool success) {
        require(_investors.length == _values.length, "Incorrect inputs");
        for (uint256 i = 0; i < _investors.length; i++) {
            mintTranche(_tranche, _investors[i], _values[i], _data);
        }
        return true;
    }

    function _burnTranche(bytes32 _tranche, address _investor, uint256 _value, bytes _data) internal returns(bool success) {
        require(_value <= trancheBalances[_investor][_tranche], "Value too high");
        require(_checkBurn(_tranche, _investor, _value, _data), "checkBurn fail");
        trancheBalances[_investor][_tranche] = trancheBalances[_investor][_tranche].sub(_value);
        totalSupply = totalSupply.sub(_value);
        trancheTotalSupply[_tranche] = trancheTotalSupply[_tranche].sub(_value);
        emit Burnt(_tranche, _investor, _value, _data);
        return true;
    }

    /**
     * @notice Used by a controller to execute a forced transfer
     * @param _tranche The tranche to allocate the increase in balance
     * @param _from address from which to take mocks
     * @param _to address where to send mocks
     * @param _value amount of mocks to transfer
     * @param _data data to indicate validation
     */
    function forceTransfer(bytes32 _tranche, address _from, address _to, uint256 _value, bytes _data) public onlyOwnerOrRole("forceTransfer") {
        require(_to != address(0));
        require(_value <= trancheBalances[_from][_tranche]);
        require(_checkTransfer(_tranche, _from, _to, _value, _data));
        trancheBalances[_from][_tranche] = trancheBalances[_from][_tranche].sub(_value);
        trancheBalances[_to][_tranche] = trancheBalances[_to][_tranche].add(_value);
        emit ForceTransfer(_tranche, msg.sender, _from, _to, _value, true, _data);
        emit TransferTranche(_tranche, address(0), msg.sender, _to,  _value, _data);
    }

    /**
     * @notice Used by a controller to execute a forced burn
     * @param _tranche The tranche to allocate the increase in balance
     * @param _from address from which to take mocks
     * @param _value amount of mocks to transfer
     * @param _data data to indicate validation
     */
    function forceBurn(bytes32 _tranche, address _from, uint256 _value, bytes _data) public onlyOwnerOrRole("forceBurn") {
        require(_burnTranche(_tranche, _from, _value, _data));
        emit ForceBurn(_tranche, msg.sender, _from, _value, true, _data);
    }

    /**
     * @notice change user's balance from one tranche to another tranche
     * @param _from tranche from which to take mocks
     * @param _to tranche where to send mocks
     * @param _value amount of mocks to transfer
     * @param _data data to indicate validation
     */
    function changeTranche(bytes32 _from, bytes32 _to, uint256 _value, bytes _data) public {
        require(_value >0);
        require(_value <= trancheBalances[msg.sender][_from]);
        require(_checkChangeTranche(msg.sender, _from, _to, _value, _data));
        trancheBalances[msg.sender][_from] = trancheBalances[msg.sender][_from].sub(_value);
        trancheBalances[msg.sender][_to] = trancheBalances[msg.sender][_to].add(_value);
        trancheTotalSupply[_from] = trancheTotalSupply[_from].sub(_value);
        trancheTotalSupply[_to] = trancheTotalSupply[_to].add(_value);
        emit ChangeTranche(msg.sender, _from, _to, _value, _data);
    }


    /**
     * @dev Approve the passed address to spend the specified amount of mocks on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _spender The address which will spend the funds.
     * @param _value The amount of mocks to be spent.
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        _approveTransfer(investorDefaultTranche[msg.sender], _spender, _value);
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Function to check the amount of mocks that an owner allowed to a spender.
     * @param _owner address The address which owns the funds.
     * @param _spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of mocks still available for the spender.
     */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowanceTransferTranche(investorDefaultTranche[_owner], _owner, _spender);
    }

    /**
     * @dev Approve the passed address to operate the specified amount of mocks on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _operator The address which will operate the funds.
     * @param _value The amount of mocks to be spent.
     */
    function approveTransfer(address _operator, uint256 _value) public returns (bool success) {
        return approveTransferTranche(investorDefaultTranche[msg.sender], _operator, _value);
    }

    /**
     * @dev Approve the passed address to operate the specified amount of mocks on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param _tranche The tranche to allocate the saving balance
     * @param _operator The address which will operate the funds.
     * @param _value The amount of mocks to be spent.
     */
    function approveTransferTranche(bytes32 _tranche, address _operator, uint256 _value) public returns (bool success) {
        _approveTransfer(_tranche, _operator, _value);
        emit ApprovalTransfer(_tranche, msg.sender, _operator, _value);
        return true;
    }

    function _approveTransfer(bytes32 _tranche, address _operator, uint256 _value) internal {
        require(_operator != address(0), "operator must be non-zero");
        allowedTransfer[msg.sender][_tranche][_operator] = _value;
    }


    /**
     * @dev Function to check the amount of mocks that an owner allowed to a operator.
     * @param _owner address The address which owns the funds.
     * @param _operator address The address which will operate the funds.
     * @return A uint256 specifying the amount of mocks still available for the spender.
     */
    function allowanceTransfer(address _owner, address _operator) public view returns (uint256) {
        return allowanceTransferTranche(investorDefaultTranche[_owner], _owner, _operator);
    }

    /**
     * @dev Function to check the amount of mocks that an owner allowed to a operator.
     * @param _tranche The tranche to allow the operate
     * @param _owner address The address which owns the funds.
     * @param _operator address The address which will operate the funds.
     * @return A uint256 specifying the amount of mocks still available for the spender.
     */
    function allowanceTransferTranche(bytes32 _tranche, address _owner, address _operator) public view returns (uint256) {
        return allowedTransfer[_owner][_tranche][_operator];
    }


    /**
     * @notice Updates internal variables when performing a transfer
     * @param _from sender of transfer
     * @param _to receiver of transfer
     * @param _value value of transfer
     * @param _data data to indicate validation
     * @return bool success
     */
    function _checkTransfer(bytes32 _tranche, address _from, address _to, uint256 _value, bytes _data) internal checkPolicy(_tranche) checkGranularity(_value) returns(bool success) {
        bool rc = IPolicy(policies[_tranche]).checkTransfer(_tranche, _from, _to, _value, _data);
        if(rc) {
            _adjustInvestorData(investorData[_tranche], _from, _to, _value, balanceOf(_to), balanceOf(_from));
        }

        return rc;
    }

    /**
     * @notice Updates internal variables when performing a transfer
     * @param _tranche The tranche to allocate the increase in balance
     * @param _to receiver of transfer
     * @param _value value of transfer
     * @param _data data to indicate validation
     * @return bool success
     */
    function _checkMint(bytes32 _tranche, address _to, uint256 _value, bytes _data) internal checkPolicy(_tranche) checkGranularity(_value) returns(bool success) {
        bool rc = IPolicy(policies[_tranche]).checkMint(_tranche, _to, _value, _data);
        if(rc) {
            _adjustInvestorData(investorData[_tranche], address(0), _to, _value, balanceOf(_to), 0);
        }

        return rc;
    }

    /**
     * @notice Updates internal variables when performing a transfer
     * @param _tranche The tranche to allocate the increase in balance
     * @param _to receiver of transfer
     * @param _value value of transfer
     * @param _data data to indicate validation
     * @return bool success
     */
    function _checkBurn(bytes32 _tranche, address _to, uint256 _value, bytes _data) internal checkPolicy(_tranche) checkGranularity(_value) returns(bool success) {
        bool rc = IPolicy(policies[_tranche]).checkMint(_tranche, _to, _value, _data);
        if(rc) {
            _adjustInvestorData(investorData[_tranche], address(0), _to, _value, balanceOf(_to), 0);
        }

        return rc;
    }

    /**
     * @notice check change tranche
     * @param _owner address The address which owns the funds
     * @param _from tranche from which to take mocks
     * @param _to tranche where to send mocks
     * @param _value amount of mocks to transfer
     * @param _data data to indicate validation
     * @return bool success
     */
    function _checkChangeTranche(address _owner, bytes32 _from, bytes32 _to, uint256 _value, bytes _data) internal checkPolicy(_from) checkPolicy(_to) checkGranularity(_value) returns(bool success) {
        bool rc = IPolicy(policies[_to]).checkChangeTranche(_owner, _from, _to, _value, _data);
        if(rc) {
            uint256 _toBalance = balanceOfTranche(_to, _owner);
            uint256 _fromBalance = balanceOfTranche(_from, _owner);
            _adjustInvestorData(investorData[_from], _owner, _owner, _value, _toBalance, _fromBalance);
            _adjustInvestorData(investorData[_to], _owner, _owner, _value, _toBalance, _fromBalance);
        }

        return rc;
    }

    /**
    * @notice Keeps track of the number of non-zero token holders
    * @param _investorData Date releated to investor metrics
    * @param _from Sender of transfer
    * @param _to Receiver of transfer
    * @param _value Value of transfer
    * @param _balanceTo Balance of the _to address
    * @param _balanceFrom Balance of the _from address
    */
    function _adjustInvestorData(
        InvestorData storage _investorData,
        address _from,
        address _to,
        uint256 _value,
        uint256 _balanceTo,
        uint256 _balanceFrom
    ) internal  {
        if ((_value == 0) || (_from == _to)) {
            return;
        }
        // Check whether receiver is a new token holder
        if ((_balanceTo == 0) && (_to != address(0))) {
            _investorData.investorCount = (_investorData.investorCount).add(1);
        }
        // Check whether sender is moving all of their tokens
        if (_value == _balanceFrom) {
            _investorData.investorCount = (_investorData.investorCount).sub(1);
        }
        //Also adjust investor list
        if (!_investorData.investorListed[_to] && (_to != address(0))) {
            _investorData.investors.push(_to);
            _investorData.investorListed[_to] = true;
        }

    }

}
