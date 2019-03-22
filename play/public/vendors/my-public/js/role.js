var RAC_ROLES=[
    'manageRole',
    'createST',
    'pausePolicyRegistry',
    'manageContract'
];

var ST_ROLES=[
    'manageRole',
    'configure',
    'mint',
    'burn',
    'forceTransfer',
    'forceBurn'
];

var GP_ROLES=[
    'manageRole',
    'modifyWhitelist'
];

(function(exports){

    exports.RAC_ROLES = RAC_ROLES;
    exports.ST_ROLES = ST_ROLES;
    exports.GP_ROLES = GP_ROLES;

}(typeof exports === 'undefined' ? this.share = {} : exports));
