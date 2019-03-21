package com.sto.sto.entity;

public class Message {
    private Integer code;
    private String msg;
    private Object data;

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public void success() {
        this.code = 0;
        this.msg = "success";
        this.data = null;
    }

    public void success(Object data) {
        this.code = 0;
        this.msg = "success";
        this.data = data;
    }


    public void failure() {
        this.code = 1;
        this.msg = "failure";
        this.data = null;
    }

    public void failure(Object data) {
        this.code = 1;
        this.msg = "failure";
        this.data = data;
    }


    public void error(Integer code, String msg, Object data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

}

