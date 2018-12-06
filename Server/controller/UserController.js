const saltRounds = 10;

let db = require('../config/config');
let resformat = require('../helper/response_format');

let transporter = require('../config/mailer');
let clientDomain = require('../config/client_domain');
let base64 = require('base-64');
let moment = require('moment');
let bcrypt = require('bcrypt');
let auth = require('basic-auth');


module.exports = {
    getUsers(req,res){
      try{
          let sql = `SELECT user_id,user_name,email FROM user_details`;
          db.query(sql,(err,results)=>{
             if(err) throw err;
             res.send(resformat.res_format(false,'OK',results));
          });
      }
      catch (e) {
          res.status(500).send(resformat.res_format(true,'Error in get all users',e));
      }
    },

    getCourse(req,res){
        try{
            let sql = `CALL get_course_list(${req.params.userid})`;
            let courses;
            let userDetails;
            db.query(sql, (err,results) => {
                if(err) throw err;
                //res.send(resformat.res_format(false,'OK',results[0]));
                courses = results[0];
                userDetails = results[1];

                courses.forEach((obj)=>{
                   obj['instructors'] = [];
                });

                userDetails.forEach((user) => {
                    let courseIdx = courses.findIndex(obj => obj.course_id === user.course_id);
                    courses[courseIdx].instructors.push(user);
                });

                res.send(resformat.res_format(false,'OK',courses));
            });
            //res.send(resformat.res_format(false,'OK',courses));
        }
        catch (err) {
            res.status(500).send(resformat.res_format(true,'error while fetching course list',err));
        }
    },

    async forgotPassword(req,res){
        try{
            let email = req.body.instructor_email;
            let sql = `select user_id from user_details where email = '${email}'`;
            let rows = await db.query(sql).catch((err)=>{
                throw err;
            });

            if(rows.length > 0){
                let end = moment().add(1,'hours').unix();
                let url = `${clientDomain.domain}resetpassword/${base64.encode(email)}/${end}`;
                let mailOptions = {
                    to: email, // receiver
                    subject: `Reset Password For UB Scheduler`, // Subject line
                    text: 'Kindly use this link to reset the password', // Text of mail
                    html: `<b>Kindly use the link provided within next 1 hour to reset the password.</b><a href="${url}">Click to reset password</a>`// plain text body
                };
                transporter.sendMail(mailOptions,(err,info)=>{
                    if(err){
                        console.log('mail send FAILED');
                        console.log(err);
                    }
                    else
                        console.log('mail send success');
                });
                res.send(resformat.res_format(false,'OK',rows));
            }
            else{
                res.send(resformat.res_format(true,'Email ID is not part of the system',null));
            }

        }
        catch (err){
            res.status(500).send(resformat.res_format(true,'Error in sending email to reset password.',err));
        }
    },

    async resetPassword(req,res){
        try{
            let userObj = auth(req);
            let userEmail = userObj.name;
            let passwordHash = bcrypt.hashSync(userObj.pass,saltRounds);
            let sql = `update user_details set password = ? where email = ?`;

            await db.query(sql,[passwordHash,userEmail]).catch((err)=>{
               throw err;
            });

            res.send(resformat.res_format(false,'OK',null));
        }
        catch (err){
            res.status(500).send(resformat.res_format(true,'Error in reset password.',err.stack));
        }
    }
};