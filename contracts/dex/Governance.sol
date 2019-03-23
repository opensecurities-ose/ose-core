pragma solidity >=0.4.24;


import "./Store.sol";
import "../modules/Ownable.sol";
import "../libraries/AddressUtils.sol";

///@title Governance means to govern the protocol well.
contract Governance is Ownable, Store {
    using AddressUtils for address;
    //relayers of the contract
    mapping(address => bool) public relayers;
    //whether is paused
    bool public paused = false;
    //token registered map from baseToken->quoteToken->true/false
    mapping(address => mapping(address => bool))public tokenRegistered;

    event RelayerChanged(address indexed _relayer, bool _bool);
    event TokenRegistered(address indexed _base, address indexed _quote);

    ///modifiers
    ///check only relayer
    modifier onlyRelayer {
        require(relayers[msg.sender], "only relayer allowed");
        _;
    }
    ///check is paused
    modifier notPaused {
        require(!paused, "contract is paused");
        _;
    }
    ///check trade token is registered
    modifier isRegistered(address _base, address _quote){
        require(tokenRegistered[_base][_quote], "token not registered");
        _;
    }

    /**
    * @dev set the relayer of the contract.
    * @param _relayer relayer address
    * @param _bool boolean to indicate that the relayer is enabled.
    */
    function setRelayer(address _relayer, bool _bool) public onlyOwner {
        require(_relayer != ETH_ADDRESS, "relayer should not be 0x0 address.");
        relayers[_relayer] = _bool;
        emit RelayerChanged(_relayer, _bool);
    }

    /**
    * @dev modify the block number of withdraw to wait.
    * @param _number block number to wait
    */
    function modifyWithdrawBlock(uint256 _number) public onlyOwner {
        require(_number >= 1, "block number to wait should be >=1.");
        WITHDRAW_BLOCK_NUM = _number;
    }

    /**
    * @dev pause this contract to fill order when emergency.
    **/
    function pause() public onlyOwner {
        paused = true;
    }
    /**
    * @dev register token as trade pair.only owner allowed.
    * @param _base base token of trade pair.0 is ETH
    * @param _quote quote token.
    **/
    function registerToken(address _base, address _quote) public onlyOwner {
        require(_quote.isContract(), "quote token is not contract");
        require(_base.isZero() || _base.isContract(), "quote token is not contract");
        if (!tokenRegistered[_base][_quote]) {
            tokenRegistered[_base][_quote] = true;
            emit TokenRegistered(_base, _quote);
        }
    }
}
