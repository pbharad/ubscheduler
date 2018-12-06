const saltRounds = 10;

let express = require('express');
let bcrypt = require('bcrypt');
let auth = require('basic-auth');

let router = express.Router();

let db = require('../config/config');
let resformat = require('../helper/response_format');

router.post('/', async (req,res) => {
    try{

        let userObj = auth(req);
        let getConflictSql = `select user_id from user_details where email = '${userObj.name}'`;
        let conflicts = await db.query(getConflictSql).catch((err)=>{
            if(err) throw err;
        });

        if(req.body.user_name === ""){
            res.send(resformat.res_format(true,'Empty username',null));
        }

        else if(conflicts.length > 0){
            res.send(resformat.res_format(true,'Email ID already exist.',null));
        }
        else{
            let passwordHash = bcrypt.hashSync(userObj.pass,saltRounds);
            let insertUserSql = `CALL set_user_details
                                 ('${req.body.user_name}','${passwordHash}','${userObj.name}')`;

            let result = await db.query(insertUserSql).catch((err)=>{
                throw err;
            });
            //let userid = result[0][0].userid;
            let responseObject = {};
            responseObject['user_id'] = result[0][0].userid;
            responseObject['user_name'] = req.body.user_name;
            responseObject['email'] =  userObj.name;
            res.send(resformat.res_format(false,'OK',responseObject));
        }
    }
    catch (e) {
        res.status(500).send(resformat.res_format(true,'Error in sign up.',e));
    }
});


module.exports = router;