// Check Jimp API
const jimp = require('jimp');
console.log('Jimp exports:', Object.keys(jimp).slice(0, 20));
const J = jimp.Jimp || jimp.default || jimp;
console.log('Jimp class methods:', typeof J, Object.getOwnPropertyNames(J).slice(0, 15));
