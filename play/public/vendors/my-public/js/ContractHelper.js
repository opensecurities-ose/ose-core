var ContractHelper = function (_prefix='') {
    var factory = new StorageHelper('STOContract'+_prefix+'-');

    return factory;

};
// dont override global variable
if (typeof window !== 'undefined' && typeof window.ContractHelper === 'undefined') {
    window.ContractHelper = ContractHelper;
}
(function(exports){

    exports.ContractHelper = ContractHelper;

}(typeof exports === 'undefined' ? this.share = {} : exports));
