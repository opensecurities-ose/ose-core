pragma solidity ^0.4.24;

import "../libraries/SafeMath.sol";

/**
 * @title Interface to be implemented by all STO modules
 */
contract ISTO  {
    /**
     * @notice Returns the total no. of tokens sold
     */
    function getTokensSold() public view returns (uint256);

}
