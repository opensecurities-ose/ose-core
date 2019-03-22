const GenerateCode = require('../../utils/GenerateCode')

console.log('GenerateCode');
let res = GenerateCode.genApi('SecurityToken', 'SecurityToken');
console.log(res);
// FileUtils.writeFile(__dirname+'/../doc/public/js/config.js', abiSecurityToken);

