const saltRounds = 10;

let express = require('express');
let bcrypt = require('bcrypt');
let auth = require('basic-auth');

let router = express.Router();

let db = require('../config/config');
let resformat = require('../helper/response_format');
/*
 user 1: pwd111
user 2: johnson1
cooper@gmail.com user 3: ccooper123
 */
router.post('/', (req, res, next) => {
    try{
        let userObject = auth(req);
        //console.log(userObject);
        let sql = `select user_id,user_name,email,password from user_details where email = '${userObject.name}'`;
        let query = db.query(sql, (err,results) => {
            if(err) throw err;
            else if(results.length === 0) res.send(resformat.res_format(true,'Invalid Email',results));
            else {
                let password = userObject.pass;
                let passwordHash = results[0].password;
                let isEqual = bcrypt.compareSync(password, passwordHash);
                    if (isEqual === true) {
                        console.log("password match");
                        let responseObject = {};
                        responseObject['user_id'] = results[0].user_id;
                        responseObject['user_name'] = results[0].user_name;
                        responseObject['email'] =  results[0].email;
                        res.send(resformat.res_format(false,'OK',responseObject));
                    }
                    else{
                        res.send(resformat.res_format(true,'Email and Password do not match',[]));
                    }
            }
        });
    }
    catch (e) {
        res.status(500).send(resformat.res_format(true,'error in login',err));
    }

});

module.exports = router;
