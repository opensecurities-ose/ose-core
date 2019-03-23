pragma solidity >=0.4.24;

import "../interfaces/IERC20.sol";
import "../libraries/SafeMath.sol";
import "./interfaces/IStore.sol";

///@title store contract of the protocol.all recodes store here
contract Store is IStore {
    using SafeMath for uint256;

    address constant ETH_ADDRESS = address(0);

    //how many blocks the user need to wait for withdraw
    uint256 public WITHDRAW_BLOCK_NUM = 500;

    //fungible tokens map from user->token->amount
    mapping(address => mapping(address => uint256)) public userTokens;

    //allowed to withdraw map from user->token->amount
    mapping(address => mapping(address => uint256)) public withdrawAllowed;
    //start block when user start to apply for withdraw.map from user->token->block number
    mapping(address => mapping(address => uint256)) public withdrawStartBlock;

    ///deposit event
    event Deposit(address indexed token, address indexed addr, uint256 amount, uint256 balance);
    ///withdraw event
    event Withdraw(address indexed token, address indexed addr, uint256 amount, uint256 balance);
    //withdraw application event
    event WithdrawApplication(address indexed token, address indexed addr, uint256 amount);


    ///@dev get balance of user's token
    ///@param _user user address
    ///@param _token token address
    ///@return the amount of token
    function balanceOf(address _user, address _token) public view returns (uint256){
        return userTokens[_user][_token];
    }

    /**
    * @dev deposit ETH to this contract
    */
    function depositETH() public payable {
        userTokens[msg.sender][ETH_ADDRESS] = userTokens[msg.sender][ETH_ADDRESS].add(msg.value);
        emit Deposit(ETH_ADDRESS, msg.sender, msg.value, userTokens[msg.sender][ETH_ADDRESS]);
    }

    /**
    * @dev deposit token(security token which is compatible with erc20) to this contract.
    * @param _token token address
    * @param _amount amount to deposit
    */
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETH_ADDRESS, "token address should not be 0x0");
        userTokens[msg.sender][_token] = userTokens[msg.sender][_token].add(_amount);
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "deposit token failed");
        emit Deposit(_token, msg.sender, _amount, userTokens[msg.sender][_token]);
    }

    /**
     * @dev withdraw token from this contract.when first call this method,
     * user has to wait at least `WITHDRAW_BLOCK_NUM` blocks and call this method again to reclaim the tokens.
     * @param _token token address
     * @param _amount amount to withdraw
     */
    function withdraw(address _token, uint256 _amount) public {
        if (withdrawAllowed[msg.sender][_token] >= _amount) {
            //enough to withdraw
            require(block.number >= withdrawStartBlock[msg.sender][_token] + WITHDRAW_BLOCK_NUM, "withdraw still waiting");

            withdrawAllowed[msg.sender][_token] = withdrawAllowed[msg.sender][_token].sub(_amount);
            userTokens[msg.sender][_token] = userTokens[msg.sender][_token].sub(_amount);
            doWithdraw(_token, _amount);
            emit Withdraw(_token, msg.sender, _amount, userTokens[msg.sender][_token]);
        } else {
            //don't have enough to withdraw,then add to withdrawAllowed and wait for N blocks
            withdrawAllowed[msg.sender][_token] = withdrawAllowed[msg.sender][_token].add(_amount);
            //set to block.number to remember when user update a new withdraw application.
            withdrawStartBlock[msg.sender][_token] = block.number;
            emit WithdrawApplication(_token, msg.sender, _amount);
        }
    }

    /**
     * @dev transfer token or eth from this contract.
     * @param _token token address
     * @param _amount amount to withdraw
     */
    function doWithdraw(address _token, uint256 _amount) internal {
        if (_token == ETH_ADDRESS) {//withdraw ether
            require(msg.sender.send(_amount), "do withdraw eth failed.");
        } else {//withdraw token
            require(IERC20(_token).transfer(msg.sender, _amount), "do withdraw token failed.");
        }
    }
}
