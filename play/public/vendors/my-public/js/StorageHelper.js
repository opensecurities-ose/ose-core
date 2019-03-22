var StorageHelper = function (_prefix='') {
    var factory = {
        _PREFIX: _prefix
    };

    factory.get = function(_key) {
        return localStorage.getItem(factory._PREFIX+_key);
    };

    factory.set = function(_key, _data) {
        if(!_key || !_data) {
            return;
        }
        if(typeof _data == 'object') {
            _data = JSON.stringify(_data);
        }
        localStorage.setItem(factory._PREFIX+_key, _data);
    };

    factory.update = function(_key, _data) {
        // console.log('_data:',_data);
        if(!_key || !_data) {
            return;
        }

        var _old = localStorage.getItem(factory._PREFIX+_key);
        if(_old) {
            try {
                _old = JSON.parse(_old);
            } catch (e) {

            }
        }
        if(typeof _data == 'object' && _old && typeof _old == 'object') {
            _data = factory.jsonMerge(_old, _data);
        }

        if(typeof _data == 'object') {
            _data = JSON.stringify(_data);
        }

        localStorage.setItem(factory._PREFIX+_key, _data);
    };

    factory.remove = function(_key) {
        localStorage.removeItem(factory._PREFIX+_key);
    };

    factory.removeMany = function(_keys=[]) {
        for(var _i=0; _i<localStorage.length; _i++) {
            if(localStorage.key(_i) === null || factory._PREFIX != localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                continue;
            }

            if(_keys.indexOf(localStorage.key(_i).substring(factory._PREFIX.length))>-1) {
                localStorage.removeItem(localStorage.key(_i));
            }

        }
    };

    factory.clear = function() {
        if(!factory._PREFIX) {
            localStorage.clear();
        }
        var _count = 0;
        for(var _i=0; _i<localStorage.length; _i++) {
            if(factory._PREFIX != localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                continue;
            }

            _count++;
            localStorage.removeItem(localStorage.key(_i));
        }
        console.log('clear,count:', _count);
    };

    factory.list = function() {
        var _res = {};
        for(var _i=0; _i<localStorage.length; _i++) {
            if(localStorage.key(_i) === null || factory._PREFIX != localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                continue;
            }

            var _val = localStorage.getItem(localStorage.key(_i));
            if(_val && typeof _val == 'object') {
                try {
                    _val = JSON.parse(_val);
                } catch (e) {

                }
            }

            _res[localStorage.key(_i).substring(factory._PREFIX.length)] = _val;
        }
        return _res;
    };

    factory.count = function() {
        var _res = 0;
        for(var _i=0; _i<localStorage.length; _i++) {
            if(factory._PREFIX == localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                _res++;
            }
        }
        return _res;
    };


    factory.jsonMerge = function (json1, json2) {
        if(!json1 ) {
            return json2;
        }
        if(!json2 ) {
            return json1;
        }

        let res = {};
        for(let k in json1) {
            res[k] =json1[k];
        }
        for(let k in json2) {
            res[k] =json2[k];
        }
        return res;
    };

    factory.exists = function(_key) {
        return localStorage.hasOwnProperty(factory._PREFIX+_key);
    };


    return factory;

};

// dont override global variable
if (typeof window !== 'undefined' && typeof window.StorageHelper === 'undefined') {
    window.StorageHelper = StorageHelper;
}
(function(exports){

    exports.StorageHelper = StorageHelper;

}(typeof exports === 'undefined' ? this.share = {} : exports));
