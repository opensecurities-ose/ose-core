package com.sto.sto.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.ethereum.crypto.ECKey;
import org.ethereum.util.ByteUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.ethereum.crypto.HashUtil;
import java.math.BigInteger;
import org.ethereum.crypto.ECKey.ECDSASignature;
import org.spongycastle.util.encoders.Hex;
import java.security.SignatureException;
import java.util.Iterator;


@Service
public class VerifySignService {
    private final static Logger log = LoggerFactory.getLogger(VerifySignService.class);

    public boolean verifySign(String account, String msg, String signature) {
        byte[] sha3Msg = this.getHashMsg(msg);
        return verify(account, sha3Msg, signature);
    }


    public boolean verifyPersonal(String account, String msg, String signature) {
        String message = "\u0019Ethereum Signed Message:\n" + msg.length() + msg;
        byte[] sha3Msg = this.getHashMsg(message);
        return verify(account, sha3Msg, signature);

    }

    public boolean verifySignTypedData(String account, String msg, String signature) {
        JSONArray jarr = JSONArray.parseArray(msg);
        StringBuffer data = new StringBuffer();
        StringBuffer schema = new StringBuffer();
        byte[] dataBytes = new byte[0];
        for (Iterator iterator = jarr.iterator(); iterator.hasNext();) {
            JSONObject jobj = (JSONObject) iterator.next();
            String type = jobj.getString("type");
            String value = jobj.getString("value");
            String name = jobj.getString("name");

            schema.append(type);
            schema.append(" ");
            schema.append(name);

            if("bool".equals(type)) {
                String v = "0";
                if ("true".equalsIgnoreCase(value)) {
                    v = "1";
                }
                data.append(v);
                BigInteger n = new BigInteger(v);
                dataBytes = ByteUtil.merge(dataBytes, ByteUtil.bigIntegerToBytes(n, 1));
            } else if(type.indexOf("uint") != -1) {
                Integer len = new Integer(type.substring(4))/8;
                BigInteger n = jobj.getBigInteger("value");
                dataBytes = ByteUtil.merge(dataBytes, ByteUtil.bigIntegerToBytes(n, len));
            } else if(type.indexOf("bytes") != -1) {
                byte[] v = this.hexToByteArray(value.trim().substring(2));
                dataBytes = ByteUtil.merge(dataBytes, v);
            } else {
                data.append(value);
                dataBytes = ByteUtil.merge(dataBytes, value.getBytes());
            }
        }

        log.debug(schema.toString());
//        log.debug(data.toString()); //only all are string
        log.debug(ByteUtil.toHexString(dataBytes));

        byte[] sha3Msg = this.getHashMsg(this.getHashMsg(schema.toString()), this.getHashMsg(dataBytes));
        return verify(account, sha3Msg, signature);

    }


    public boolean verify(String account, byte[] sha3Msg, String signature) {
        boolean rc = false;
        account = this.getAccount(account);
        ECDSASignature sig = this.getSign(signature);

        try {
            ECKey key = ECKey.signatureToKey(sha3Msg, sig.toBase64());
            String address = Hex.toHexString(key.getAddress());
            log.debug("Signature public key: " + Hex.toHexString(key.getPubKey()));
            log.debug("Sender is: " + address);
            rc = key.verify(sha3Msg, sig);
            if(!account.equalsIgnoreCase(address)) {
                rc = false;
            }
        } catch (SignatureException e) {
            log.error(e.getMessage());
        }

        log.debug("rc:"+rc);
        return rc;
    }


    private String getAccount(String account) {
        if("0x".equalsIgnoreCase(account.substring(0,2))) {
            account = account.substring(2);
        }
        return account;
    }


    private byte[] getHashMsg(byte[] msg) {
        return HashUtil.sha3(msg);
    }

    private byte[] getHashMsg(String msg) {
        return HashUtil.sha3(msg.getBytes());
    }

    private byte[] getHashMsg(byte[] msg1, byte[] msg2) {
        return HashUtil.sha3(msg1, msg2);
    }


    private ECDSASignature getSign(String signature) {
        if("0x".equalsIgnoreCase(signature.substring(0,2))) {
            signature = signature.substring(2);
        }

        String _r = signature.substring(0, 64);
        String _s = signature.substring(64, 128);
        String _v = signature.substring(128, 130);

        BigInteger r = new BigInteger(_r, 16);
        BigInteger s = new BigInteger(_s, 16);
        BigInteger v = new BigInteger(_v, 16);

        ECDSASignature sig = ECDSASignature.fromComponents(r.toByteArray(), s.toByteArray(), v.byteValue());
        return sig;
    }

    /**
     * hex string to bytes array
     * @param inHex string
     * @return  bytes[]
     */
    public byte[] hexToByteArray(String inHex){
        int hexlen = inHex.length();
        byte[] result;
        if (hexlen % 2 == 1){
            //odd
            hexlen++;
            result = new byte[(hexlen/2)];
            inHex = "0"+inHex;
        }else {
            //
            result = new byte[(hexlen/2)];
        }
        int j=0;
        for (int i = 0; i < hexlen; i+=2){
            result[j] = (byte)Integer.parseInt(inHex.substring(i,i+2),16);
            j++;
        }
        return result;
    }

}
