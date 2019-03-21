pragma solidity ^0.4.24;

import "./Store.sol";
import "./Governance.sol";
import "../libraries/Crypto.sol";
import "./interfaces/IExchange.sol";

contract ExchangeCore is IExchange, Store, Governance, Crypto {

    //order filled map from user->orderId->filledAmount
    mapping(address => mapping(bytes32 => uint256)) public userOrders;
    //order canceled by the user map from user->orderId->true/false
    mapping(address => mapping(bytes32 => bool)) canceledOrders;

    event OrderCancel(address indexed user, bytes32 orderId);

    ///default function.transfer ether to this contract is not allowed by default
    function() public {
        revert();
    }

    ///order struct
    struct Order {
        address tokenGet;
        address tokenGive;
        uint256 amountGet;
        uint256 amountGive;
        address user;
        uint256 fee;
        uint256 salt;
        bytes32 orderId;
        address baseToken;
    }

    /**
    * @dev settle taker and maker's orders
    *
    * @param _addresses :
    * - 0:token address of maker get;
    * - 1:token address of taker get;
    * - 2:token address of maker give;
    * - 3:token address of  taker give;
    * - 4:maker address;
    * - 5:taker address;
    * - 6:base token address of maker .default is 0 ,then base token is ETH;
    * - 7:base token address of taker .default is 0 ,then base token is ETH;
    * @param _values :
    * - 0:amount of maker get
    * - 1:amount of taker get
    * - 2:amount of maker give
    * - 3:amount of taker give
    * - 4:fee(base token) that maker need to pay
    * - 5:fee(base token) that taker need to pay
    * - 6:maker's salt number
    * - 7:taker's salt number
    * - 8:amount of traded token
    * @param _makerSig maker's signature in 65 bytes
    * @param _takerSig maker's signature in 65 bytes
    **/
    function settleOrder(address[8] _addresses, uint256[9] _values, bytes _makerSig, bytes _takerSig)
    public notPaused onlyRelayer{
        Order memory maker = Order({
            tokenGet : _addresses[0],
            tokenGive : _addresses[2],
            user : _addresses[4],
            amountGet : _values[0],
            amountGive : _values[2],
            fee : _values[4],
            salt : _values[6],
            orderId : 0x0,
            baseToken : _addresses[6]
            });
        Order memory taker = Order({
            tokenGet : _addresses[1],
            tokenGive : _addresses[3],
            user : _addresses[5],
            amountGet : _values[1],
            amountGive : _values[3],
            fee : _values[5],
            salt : _values[7],
            orderId : 0,
            baseToken : _addresses[7]
            });
        //generate orderId.the salt param is to ensure the orderId is unique
        maker.orderId = generateOrderId(maker.tokenGet, maker.amountGet, maker.tokenGive, maker.amountGive, maker.baseToken, maker.salt);
        taker.orderId = generateOrderId(taker.tokenGet, taker.amountGet, taker.tokenGive, taker.amountGive, taker.baseToken, taker.salt);

        //make sure order is not canceled
        require(!canceledOrders[maker.user][maker.orderId], "make order is canceled.");
        require(!canceledOrders[taker.user][taker.orderId], "taker order is canceled.");
        //maker sure order signature is correct
        require(validateSignature(maker.orderId, maker.user, _makerSig), "maker signature is error.");
        require(validateSignature(taker.orderId, taker.user, _takerSig), "taker signature is error.");

        // make sure maker and taker have the same trade pair
        require(maker.baseToken == taker.baseToken, "base token not the same.");
        require((maker.tokenGet == taker.tokenGive && maker.tokenGive == taker.tokenGet) && (taker.baseToken == taker.tokenGet || taker.baseToken == taker.tokenGive)
        , "maker and taker not the same trade pair.");

        //make sure token registered
        require(tokenRegistered[maker.baseToken][maker.tokenGet]||tokenRegistered[maker.baseToken][maker.tokenGive],"maker token not registered");
        require(tokenRegistered[taker.baseToken][taker.tokenGet]||tokenRegistered[taker.baseToken][taker.tokenGive],"taker token not registered");

        ///match order and do settlement
        matchSettle(maker, taker, _values[8]);
    }

    /**
    * @dev match orders and do settlement on chain
    * @param maker maker's order info
    * @param taker taker's order info
    * @param traded trade amount submitted by relayer
    **/
    function matchSettle(Order maker, Order taker, uint256 traded) internal {
        //match maker and taker order
        (uint256 takerGet, uint256 takerGive) = doMatch(maker, taker, traded);

        //do settle
        doSettle(maker, taker, takerGet, takerGive);

    }

    /**
    * @dev match maker and taker's orders
    * @param maker maker's order info
    * @param taker taker's order info
    * @param traded trade amount submitted by relayer
    **/
    function doMatch(Order maker, Order taker, uint256 traded) internal returns (uint256 takerGet, uint256 takerGive){
        //make sure sell price>=buy price
        require(maker.amountGive.mul(taker.amountGive) >= maker.amountGet.mul(taker.amountGet), "price not match");

        if (taker.baseToken == taker.tokenGet) {
            //taker sell
            uint256 makerAmount = maker.amountGet - userOrders[maker.user][maker.orderId];
            uint256 takerAmount = taker.amountGive - userOrders[taker.user][taker.orderId];
            require(traded > 0 && traded <= makerAmount && traded <= takerAmount, "trade amount error.");

            takerGive = traded;
            takerGet = (maker.amountGive * takerGive) / maker.amountGet;
            userOrders[taker.user][taker.orderId] = userOrders[taker.user][taker.orderId] + takerGive;
            userOrders[maker.user][maker.orderId] = userOrders[maker.user][maker.orderId] + takerGive;
        } else {
            // taker buy
            takerAmount = taker.amountGet - userOrders[taker.user][taker.orderId];
            makerAmount = maker.amountGive - userOrders[maker.user][maker.orderId];
            require(traded > 0 && traded <= makerAmount && traded <= takerAmount, "trade amount error.");
            takerGet = traded;
            takerGive = (maker.amountGet * takerGet) / maker.amountGive;
            userOrders[taker.user][taker.orderId] = userOrders[taker.user][taker.orderId] + takerGet;
            userOrders[maker.user][maker.orderId] = userOrders[maker.user][maker.orderId] + takerGet;
        }
        return (takerGet, takerGive);
    }

    /**
    * @dev do exact settlement on chain.
    * @param maker maker's order info
    * @param taker taker's order info
    * @param takerGet the amount of token that taker get
    * @param takerGive the amount of token that taker give
    **/
    function doSettle(Order maker, Order taker, uint256 takerGet, uint256 takerGive) internal {
        //charge fees
        userTokens[msg.sender][maker.tokenGet] = userTokens[msg.sender][maker.tokenGet] + maker.fee;
        userTokens[msg.sender][taker.tokenGet] = userTokens[msg.sender][taker.tokenGet] + taker.fee;

        //change balance
        userTokens[taker.user][taker.tokenGive] = userTokens[taker.user][taker.tokenGive] - takerGive;

        userTokens[taker.user][taker.tokenGet] = userTokens[taker.user][taker.tokenGet] + takerGet - taker.fee;

        userTokens[maker.user][maker.tokenGive] = userTokens[maker.user][maker.tokenGive] - takerGet;

        userTokens[maker.user][maker.tokenGet] = userTokens[maker.user][maker.tokenGet] + takerGive - maker.fee;
    }

    /**
    * @dev cancel the order by user.
    * @param _tokenGet tokenGet address
    * @param _amountGet amountGet
    * @param _tokenGive tokenGive address
    * @param _amountGive amountGive
    * @param _base the base token address
    * @param _salt the salt number of the order
    **/
    function cancelOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive, address _base, uint256 _salt) public returns (bool){
        bytes32 orderId = generateOrderId(_tokenGet, _amountGet, _tokenGive, _amountGive, _base, _salt);
        canceledOrders[msg.sender][orderId] = true;
        emit OrderCancel(msg.sender, orderId);
        return true;
    }
}
