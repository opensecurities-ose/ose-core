module.exports = class Message {
    static success(data='') {
        return {
            code: 0,
            msg: 'success',
            data: data
        }
    }

    static fail(data='') {
        return {
            code: 1,
            msg: 'fail',
            data: data
        }
    }

    static error(code=1, msg='fail', data='') {
        return {
            code: code,
            msg: msg,
            data: data
        }
    }
};
