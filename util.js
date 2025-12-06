// historyUtils.js
const moment = require("moment")
const maria = require('./maria'); // maria 모듈을 import 또는 require하여 가져옵니다.
const cryptoJs = require('crypto-js');

const secretKey = '12345678901234567890123456789012' // 32자리 비밀키
const iv = 'abcdefghijklmnop' // 16자리 iv


function createHistory(regId,  des) {
    const historyQuery = `INSERT INTO history (SEQ, REG_ID, DATE, DESCRIPTION) VALUES ((SELECT IFNULL(MAX(A.SEQ),0)+1 FROM history A), ?, ?, ?)`;
    const formattedDateTime = moment().format('YYYY.MM.DD HH:mm');
    return maria(historyQuery, [regId, formattedDateTime, des]);
}


const encrypt = (text) => {
    const cipher = cryptoJs.AES.encrypt(text, cryptoJs.enc.Utf8.parse(secretKey), {
        iv: cryptoJs.enc.Utf8.parse(iv),
        padding: cryptoJs.pad.Pkcs7,
        mode: cryptoJs.mode.CBC,
    });

    return cipher.toString();
}

// 복호화
const decrypt = (encryptedText) => {
    const decipher = cryptoJs.AES.decrypt(encryptedText, cryptoJs.enc.Utf8.parse(secretKey), {
        iv: cryptoJs.enc.Utf8.parse(iv),
        padding: cryptoJs.pad.Pkcs7,
        mode: cryptoJs.mode.CBC,
    })

    return decipher.toString(cryptoJs.enc.Utf8);
}
module.exports = {
    createHistory,
    encrypt,
    decrypt
};
