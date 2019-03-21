pragma solidity ^0.4.24;

import "../libraries/SafeMath.sol";
import "../interfaces/IERC20.sol";

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20Token is IERC20 {
    using SafeMath for uint256;

    string public name = "Test Token";
    string public symbol = "TST";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) internal allowed;

    /**
    * @dev Constructor for token creation
    * @dev Assigns the totalSupply to the token contract
    */
    constructor () public {
        totalSupply = 1000000000 * 10**18;
        balances[msg.sender] = totalSupply;
    }

    /**
    * @dev Returns the balance of the specified address
    * @param _owner The address to query the the balance of
    * @return An uint256 representing the amount owned by the passed address
    */
    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    /**
    * @dev Function to check the amount of mocks a spender is allowed to spend
    * @param _owner address The address which owns the mocks
    * @param _spender address The address which will spend the mocks
    * @return A uint256 specifying the amount of mocks left available for the spender
    */
    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    /**
    * @dev Transfer token to a specified address
    * @param _to The address to transfer mocks to
    * @param _value The amount to be transferred
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid address");
        require(_value <= balances[msg.sender], "Insufficient tokens transferable");

        // SafeMath.sub will throw if the balance is not enough
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
    * @dev Transfers mocks from one address to another
    * @param _from address The address to transfer mocks from
    * @param _to address The address to transfer mocks to
    * @param _value uint256 The amount of mocks to be transferred
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Invalid address");
        require(_value <= balances[_from], "Insufficient tokens transferable");
        require(_value <= allowed[_from][msg.sender], "Insufficient tokens allowable");

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
    * @dev Approves the passed address to spend the specified amount of mocks on behalf of msg.sender
    *
    * Beware that changing an allowance with this method brings the risk that someone may use both the old
    * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
    * race condition is to reduce the spender's allowance to 0 first and set the desired value afterwards:
    * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    * @param _spender The address which will spend the funds
    * @param _value The amount of mocks to be spent
    */
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
    * @dev Increases the amount of mocks that an owner has allowed a spender to spend
    *
    * approve should be called when allowed[_spender] == 0. To increment
    * allowed value, it is better to use this function to avoid 2 calls (and wait until
    * the first transaction is mined)
    * From MonolithDAO Token.sol
    * @param _spender The address which will spend the funds.
    * @param _addedValue The amount of mocks to increase the allowance by.
    */
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /**
    * @dev Decreases the amount of mocks that an owner has allowed a spender to spend
    *
    * approve should be called when allowed[_spender] == 0. To decrement
    * allowed value, it is better to use this function to avoid 2 calls (and wait until
    * the first transaction is mined)
    * From MonolithDAO Token.sol
    * @param _spender The address which will spend the funds
    * @param _subtractedValue The amount of mocks to decrease the allowance by
    */
    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

}
