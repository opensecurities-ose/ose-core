pragma solidity ^0.4.24;

interface IExchange {

    /// @dev settle taker and maker's orders.both erc20 and erc721 are supported.
    /// some conditions need to be check:
    /// * maker and taker signatures ;
    /// * maker and taker have the same trade pair;
    /// * maker and taker orders not canceled;
    /// * sell price >= buy price;
    /// * trade amount not overflow;
    ///
    /// @param _addresses :
    /// - 0:token address of maker get;
    /// - 1:token address of taker get;
    /// - 2:token address of maker give;
    /// - 3:token address of  taker give;
    /// - 4:maker address;
    /// - 5:taker address;
    /// - 6:base token address of maker .default is 0 ,then base token is ETH;
    /// - 7:base token address of taker .default is 0 ,then base token is ETH;
    /// @param _values :
    /// - 0:amount of maker get
    /// - 1:amount of taker get
    /// - 2:amount of maker give
    /// - 3:amount of taker give
    /// - 4:fee(base token) that maker need to pay
    /// - 5:fee(base token) that taker need to pay
    /// - 6:maker's salt number
    /// - 7:taker's salt number
    /// - 8:amount of traded token
    /// @param _makerSig maker's signature in 65 bytes
    /// @param _takerSig maker's signature in 65 bytes
    function settleOrder(address[8] _addresses, uint256[9] _values, bytes _makerSig, bytes _takerSig);
}
