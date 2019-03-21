var TxMessageHelper = function (uid='') {
    var factory = new StorageHelper('STOTXMSG'+uid+'-');
    factory._isHandle = false;
    factory.etime = 30000;
    factory.processCallback = null;

    factory.setUid = function(uid) {
        factory._PREFIX = 'STOTXMSG'+uid+'-';
    };

    factory.process = function(_data) {
        // console.log('process:', _data);
        if(! _data) {
            return;
        }

        factory.clear();

        if(!factory.exists(_data.transactionHash)) {
            factory.set(_data.transactionHash, Date.now());

            // call message
            // ajax getMessageTxid(_data.transactionHash, function() {
            //      show message
            // })
        }

    };

    // clear 24 hours before
    factory.clear = function() {
        var _count = 0;
        for(var _i=0; _i<localStorage.length; _i++) {
            if(factory._PREFIX != localStorage.key(_i).substring(0,factory._PREFIX.length)) {
                continue;
            }

            var _time = localStorage.getItem(localStorage.key(_i));
            _time = parseInt(_time);
            if(Date.now() - _time > 3600000) {
                _count++;
                localStorage.removeItem(localStorage.key(_i));
            }

        }
        console.log('TxMessageHelper clear,count:', _count);
    };

    return factory;

};
// dont override global variable
if (typeof window !== 'undefined' && typeof window.TxMessageHelper === 'undefined') {
    window.TxMessageHelper = TxMessageHelper;
}
(function(exports){

    exports.TxMessageHelper = TxMessageHelper;

}(typeof exports === 'undefined' ? this.share = {} : exports));
