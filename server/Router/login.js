const express = require('express');
const router = express.Router();
const maria = require("../maria");
// const fs = require('fs');
// const moment = require("moment");
// const path = require('path');
const { encrypt, decrypt } = require('../util');
// 로그인 하기 
router.post("/login", (req,res)=>{
    const {id, password} = req.body;
    //['foresthealing' , 'tksflaglffld113*']
    try{
    const sql = "SELECT * FROM user_info  WHERE USER_ID= ? AND USER_PWD= ?"
  //  const sessionStorePath = '/web/foresthealing/sessions'; // 원하는 세션 파일 저장 경로

        // fs.readdir(sessionStorePath, (err, files) => {
        //     if (err) {
        //         console.error(err);
        //     return;
        //     }
        //     const now = moment();
        //     const sessionFiles = files.filter(file => file.endsWith('.json'));
            
        //     sessionFiles.forEach(file => {
        //     const filePath = path.join(sessionStorePath, file); // 경로 생성 방식 변경
        //     const fileContent = fs.readFileSync(filePath, 'utf-8'); 
        //     const sessionData = JSON.parse(fileContent);
        //     const expires = moment(sessionData.cookie.expires);        
        //     if (expires && expires.isBefore(now)) {
        //         fs.unlink(filePath, (err) => {
        //         if (err) {
        //             console.error(err);
        //             return;
        //         }
        //         console.log(`${filePath} is deleted.`);
        //         });
        //     }
        //     });
        // });
        
        
    const encPassword = encrypt(password);
    

    maria(sql, [id, encPassword])
    .then((rows) => {
        if(rows.length > 0){

            req.session.userInfo = { ...rows[0] };

            res.json({ message: '로그인 되었습니다.', isLogin: true, result: true });
        }else{
            res.json({message : '로그인 정보를 확인해 주세요.', isLogin : false, result : true})
        }
    })
    .catch((err) =>{
        console.log(err)
            res.status(500).json({ error: "오류가 발생하였습니다. 관리자에게 문의하세요 " })
        });
    }catch(e){
        console.log(e)
    }

});

router.post("/logout", (req, res)=>{
    
    if(req.session){
        req.session.destroy(()=>{
            res.json({message : "logout success"})
        });
    }
    
})


// 사용자 등록
router.post('/register', (req, res)=>{
    const {id, name, password} = req.body;
    
    const encPassword = encrypt(password)
    
    const sql = `INSERT INTO user_info(user_id, user_name, user_pwd, value) VALUES(?,?,?,'1')`;
    maria(sql, [id, name, encPassword])
        .then(() => {
            res.json({ result: true });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "등록중 오류가 발생했습니다. 관리자에게 문의하세요 " });
        });
});

router.post('/loginCheck', (req, res)=>{ 
    if (req.session.userInfo) {
        // 세션에 사용자 정보가 존재하면 로그인 상태로 판단
        const userInfo = req.session.userInfo;
        res.json({ message: "logged in", userInfo, isLogin : true });
    } else {
        // 세션에 사용자 정보가 없으면 로그아웃 상태로 판단
        res.json({ message: "logged out", isLogin : false });
    }
});



module.exports = router;