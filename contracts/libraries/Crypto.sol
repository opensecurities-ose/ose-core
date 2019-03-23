pragma solidity >=0.4.24;

contract Crypto {
    /**
    * @dev generate the orderId from order info
    * @param tokenGet tokenGet address
    * @param amountGet amountGet
    * @param tokenGive tokenGive address
    * @param amountGive amountGive
    * @param base the base token address
    * @param salt the salt number of the order
    **/
    function generateOrderId(address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address base, uint256 salt) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), tokenGet, amountGet, tokenGive, amountGive, base, salt));
    }

    /**
    * @dev valid the signature of _hash signed with _signer
    * @param _hash hash to be signed
    * @param _signer signer's address
    * @param _signature signature provided
    **/
    function validateSignature(bytes32 _hash, address _signer, bytes memory _signature) public pure returns (bool isValid){
        //signed with web3.eth_sign
        require(_signature.length == 65, "signature length should be 65 bytes.");

        //variables of signature:{r}{s}{v}
        uint8 v;
        bytes32 r;
        bytes32 s;

        // Read the bytes from array memory
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := and(mload(add(_signature, 65)), 255)
        }
        if (v < 27) v += 27;

        isValid = ecrecover(
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)),
            v, r, s) == _signer;
        return isValid;
    }

}
