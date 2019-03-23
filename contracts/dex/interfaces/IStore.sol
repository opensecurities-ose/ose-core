pragma solidity >=0.4.24;

///@title the Store interface that recode the assets of erc20 or erc721
interface IStore {

    ///@dev get balance of user's token
    ///@param _user user address
    ///@param _token token address of erc20 or erc721
    ///@return the amount of erc20 or tokenId of erc721
    function balanceOf(address _user, address _token) external returns (uint256);
    ///@dev deposit ETH to the contract
    function depositETH() external payable;

    ///@dev deposit erc20 or erc721 token to the contract
    ///@param _token token contract address
    ///@param _value token amount of erc20,or tokenId of erc721
    function depositToken(address _token, uint256 _value) external;

    ///@dev withdraw erc20 or erc721 from the contract
    ///@param _token token contract address
    ///@param _value token amount of erc20,or tokenId of erc721
    function withdraw(address _token, uint256 _value) external;
}
