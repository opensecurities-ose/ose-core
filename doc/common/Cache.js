
var DataSetConf = {
};

class Cache{
    static async init() {
        // Log.info('init data');
        return DataSetConf;
    }

    static cache(_key='', _val='') {
        if(_key != '' && _val != '') {
            if(!DataSetConf) {
                DataSetConf = {};
            }
            DataSetConf[_key] = _val;
            return;
        }

        if(_key != '') {
            return DataSetConf[_key];
        }

        return DataSetConf;
    }

}

module.exports = Cache;
