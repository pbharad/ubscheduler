let moment = require('moment');
let base64 = require('base-64');
let replaceall = require('replaceall');

let db = require('../config/config');
let resformat = require('../helper/response_format');

module.exports = {
    async setTaAvailability(req,res){
        try{
            let sql = `Update rules_details set availability = ? where 
                        course_id = ${req.params.courseid} and ta_email = '${base64.decode(req.params.taemail)}'`;


            await db.query(sql,[JSON.stringify(req.body.availability)]).catch((err)=>{
                throw err;
            });

            res.send(resformat.res_format(false,'OK',req.body.availability));
        }
        catch (e) {
            res.status(500).send(resformat.res_format(true,'Error in setting TA availability',e.stack));
        }
    },

    async getCourseDetails(req,res){
        try{
            let courseSql = `select course_id,course_number,course_semester,course_name from course_details 
                              where course_id = ${req.params.courseid}`;

            let result = await db.query(courseSql).catch((err)=>{
                throw err;
            });

            res.send(resformat.res_format(false,'OK',result[0]));

        }
        catch (e) {
            res.status(500).send(resformat.res_format(true,'Error in fetching course and ta details in TA controller'));
        }
    }
};