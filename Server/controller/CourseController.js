let moment = require('moment');
let base64 = require('base-64');
let fs = require('file-system');
let Excel = require('exceljs');

let db = require('../config/config');
let resformat = require('../helper/response_format');
let transporter = require('../config/mailer');
let clientDomain = require('../config/client_domain');

module.exports = {
    async setSchedule(req,res){
        try{
            //${JSON.stringify(req.body.schedule)}
            /*let sql = `CALL set_course_schedule(${req.params.courseid},'${JSON.stringify(req.body.schedule)}','${JSON.stringify(req.body.violations)}')`;*/
            let sql = `CALL set_course_schedule(${req.params.courseid},?,?)`;
            let query = await db.query(sql,[JSON.stringify(req.body.schedule),JSON.stringify(req.body.violations)]);
            res.send(resformat.res_format(false,'OK',req.body.schedule));
        }
        catch (err) {
            res.status(500).send(resformat.res_format(true,'error setting the schedule',err));
        }
    },

    async getSchedule(req,res){
        try {
            let scheduleSql = `SELECT sd.schedule,cd.course_rules,sd.violations FROM course_details cd LEFT JOIN schedule_details sd ON 
                    cd.schedule_id = sd.schedule_id WHERE cd.course_id = ${req.params.courseid}`;
            let taSql = `SELECT ta_email,ta_name,ta_type,rules,availability FROM rules_details WHERE course_id = ${req.params.courseid};`;
            let finalResult = {};
            let scheduleResult = await db.query(scheduleSql).catch((err)=>{
                throw err;
            });
            let schedule = '[]';
            let courseRules = '[]';
            let violations = '[]';
            if(scheduleResult.length > 0) {
                schedule = scheduleResult[0].schedule;
                courseRules = scheduleResult[0].course_rules;
                violations = scheduleResult[0].violations;
            }
            finalResult['schedule'] = JSON.parse(schedule);
            finalResult['course_rules'] = JSON.parse(courseRules);
            finalResult['violations'] = JSON.parse(violations);

            let TAResult = await db.query(taSql).catch((err)=>{
                throw err;
            });

            TAResult.forEach((ta)=>{
               ta.rules = JSON.parse(ta.rules);
               ta.availability = JSON.parse(ta.availability);
            });

            finalResult['ta_details'] = TAResult;

            res.send(resformat.res_format(false,'OK',finalResult));
        }
        catch (err) {
            res.status(500).send(resformat.res_format(true,'Error in get schedule block',err));
        }

    },

    async getCourseInfo(req,res){
      try{
          let sql = `CALL get_course_info(${req.params.courseid})`;
          let result = await db.query(sql).catch((err)=>{
             throw err;
          });

          let responseObject = {};
          result[0][0]['course_rules'] = JSON.parse(result[0][0].course_rules);


          // format of course rules
          let courseRules = result[0][0]['course_rules'];
          /*let dict = {};
          courseRules.forEach((obj)=>{
              let start = moment(obj['start']);
              let end = moment(obj['end']);
              let key = start.format('HH:mm')+'#'+end.format('HH:mm');
              let bindObject = {};
              bindObject['start'] = start.format('HH:mm');
              bindObject['end'] = end.format('HH:mm');
              bindObject['dates'] = [];
              if(key in dict)
                  bindObject = dict[key];

              bindObject['dates'].push(start.format('YYYY-MM-DD'));
              dict[key] = bindObject;
          });*/
          let updatedRules = [];
          courseRules.forEach((obj)=>{
              let start = moment(obj['start']);
              let end = moment(obj['end']);
              //let key = start.format('HH:mm')+'#'+end.format('HH:mm');
              let bindObject = {};
              bindObject['start'] = start.format('HH:mm');
              bindObject['end'] = end.format('HH:mm');
              bindObject['date'] = start.format('YYYY-MM-DD');
              bindObject['sec_id'] = obj['sec_id'];
              bindObject['color'] = obj['color'];
              updatedRules.push(bindObject);
          });


          result[0][0]['course_rules'] = updatedRules;

          responseObject['courseDetails'] = result[0][0];
          responseObject['instructorDetails'] = result[1];
          result[2].forEach((obj)=>{
              if(obj.rules !== null)
                  obj.rules = JSON.parse(obj.rules);
          });
          responseObject['taDetails'] = result[2];

          res.send(resformat.res_format(false,'OK',responseObject));
      }
      catch (e) {
          res.status(500).send(resformat.res_format(true,'Error in get course details block',e));
      }
    },

    async addEditCourseInfo(req,res){
        try{
            let reqBody = req.body;

            // update course details
            /*let courseSql = `call set_course_details(${reqBody.courseDetails.course_id},
            '${reqBody.courseDetails.course_number}','${reqBody.courseDetails.course_semester}',
            '${JSON.stringify(reqBody.courseDetails.course_rules)}','${reqBody.courseDetails.course_name}'
            ,'${reqBody.courseDetails.course_desc}')`;*/

            let courseSql = `call set_course_details(${reqBody.courseDetails.course_id},?,?,?,?,?)`;

            let courseResult = await db.query(courseSql,[reqBody.courseDetails.course_number,
                reqBody.courseDetails.course_semester,JSON.stringify(reqBody.courseDetails.course_rules),
                reqBody.courseDetails.course_name,reqBody.courseDetails.course_desc]).catch((err)=>{
                throw err;
            });
            let courseid = courseResult[0][0].courseid;

            // update instructor details
            let instructorAdd = reqBody.instructorDetails['insert'];
            instructorAdd.forEach(async (instructor) => {
               let addInstructorSql = `INSERT INTO course_instructor_mapping (user_id,course_id,is_active) 
               VALUES (${instructor},${courseid},1)`;

               await db.query(addInstructorSql).catch((err)=>{
                   throw err;
               });
            });
            let instructorDelete = reqBody.instructorDetails['remove'];
            instructorDelete.forEach(async (instructor)=>{
               let deleteInstructorSql = `DELETE FROM course_instructor_mapping 
               WHERE user_id = ${instructor} and course_id = ${courseid}`;

                await db.query(deleteInstructorSql).catch((err)=>{
                    throw err;
                });
            });

            //update TA details
            let taDelete = reqBody.taDetails['remove'];
            taDelete.forEach(async (ta)=>{
               let deleteTaSql = `Delete from rules_details 
               where ta_email = ? and course_id = ${courseid}`;

               await db.query(deleteTaSql,[ta.ta_email]).catch((err)=>{
                  throw err;
               });
            });

            let allTaSql = `select ta_email from rules_details where course_id = ${courseid}`;
            let taAdd = reqBody.taDetails['insert'];

            let allTA = await db.query(allTaSql).catch((err)=>{
                throw err;
            });

            allTA = allTA.map((obj)=>{
               return obj.ta_email;
            });

            let newTA = taAdd.map((obj)=>{
                return obj.ta_email;
            });
            //newTA.push('adityasu@buffalo.edu');
            newTA = newTA.filter((mailId)=>{
               if(!allTA.includes(mailId))
                   return mailId;
            });

            newTA.forEach((taEmail)=>{
                let url = `${clientDomain.domain}Questionnaire/${base64.encode(taEmail)}/${courseid}`;
                let mailOptions = {
                    to: taEmail, // list of receivers
                    subject: `Questionnaire for ${reqBody.courseDetails.course_semester}
                     ${reqBody.courseDetails.course_number}-${reqBody.courseDetails.course_name}`, // Subject line
                    text: 'Kindly fill out the questionnaire form with your availability.', // Text of mail
                    html: `<b>Kindly fill out the questionnaire form with your availability.</b><a href="${url}">Click and got to Questionnaire</a>`// plain text body
                };
                transporter.sendMail(mailOptions,(err,info)=>{
                    if(err){
                        console.log('mail send FAILED');
                        console.log(err);
                    }
                    else
                        console.log('mail send success');
                })
            });

            /*console.log(newTA);
            console.log(allTA);*/

            taAdd.forEach(async (ta)=>{
                /*let addTaSql = `call set_ta_details(${courseid},'${(ta.ta_email).toLowerCase()}','${ta.ta_name}','${ta.ta_type}','${JSON.stringify(ta.rules)}')`;*/
                let addTaSql = `call set_ta_details(${courseid},?,?,'${ta.ta_type}',?)`;
                await db.query(addTaSql,[(ta.ta_email).toLowerCase(),ta.ta_name,JSON.stringify(ta.rules)]).catch((err)=>{
                    throw err;
                });
            });

            let responseObject = {};
            responseObject['course_id'] = courseid;
            res.send(resformat.res_format(false,'OK',responseObject));

        }
        catch (e) {
            res.status(500).send(resformat.res_format(true,'Error in add edit course',e.stack));
        }
    },

    async deleteCourse(req,res){
        try{
            let sqlDeleteSchedule = `delete from schedule_details where schedule_id in 
                                (select schedule_id from course_details where course_id = ${req.params.courseid})`;
            await db.query(sqlDeleteSchedule).catch((err)=>{
               throw err;
            });

            let sqlDeleteCourse = `delete from course_details where course_id = ${req.params.courseid}`;
            await db.query(sqlDeleteCourse).catch((err)=>{
               throw err;
            });
            res.send(resformat.res_format(false,'OK',req.params.courseid));
        }
        catch (e) {
            res.status(500).send(resformat.res_format(true,'Error in Delete Course',e));
        }
    },

    async downloadSchedule(req,res){
        try{
            let getScheduleSql = `SELECT sd.schedule FROM schedule_details sd JOIN course_details cd ON
                    cd.schedule_id = sd.schedule_id WHERE cd.course_id = ${req.params.courseid}`;
            let scheduleResult = await db.query(getScheduleSql).catch((err)=>{
               throw err;
            });

            let schedule = JSON.parse(scheduleResult[0].schedule);

            schedule.sort(function(a,b){
                if((moment(a.start)).isBefore(moment(b.start))){
                    return -1;
                }else if((moment(a.start)).isAfter(moment(b.start))){
                    return 1;
                }else{
                    return 0;
                }
            });
            fs.unlink('samplefile.xlsx', function (err) {
                console.log('Deletion sucessful.');
            });
            let workbook = new Excel.Workbook();
            let worksheet = workbook.addWorksheet('Schedule');
            // add column headers
            worksheet.columns = [
                { header: 'Sunday', key: 'sunday', width:30, bold:true},
                { header: 'Monday', key: 'monday', width:30, bold:true},
                { header: 'Tuesday', key: 'tuesday', width:30, bold:true},
                { header: 'Wednesday', key: 'wednesday', width:30, bold:true},
                { header: 'Thursday', key: 'thursday', width:30, bold:true},
                { header: 'Friday', key: 'friday', width:30, bold:true},
                { header: 'Saturday', key: 'saturday', width:30, bold:true}
            ];
            let col = {
                "Sunday" : "A",
                "Monday" : "B",
                "Tuesday" : "C",
                "Wednesday" : "D",
                "Thursday" : "E",
                "Friday" : "F",
                "Saturday" : "G"
            };
            let row = {
                "Sunday" : 3,
                "Monday" :3,
                "Tuesday" : 3,
                "Wednesday" : 3,
                "Thursday" : 3,
                "Friday" : 3,
                "Saturday" : 3
            };
            let slots = {
                "8:00 AM" : 3,
                "8:30 AM" : 3,
                "9:00 AM" : 5,
                "9:30 AM" : 5,
                "10:00 AM" : 7,
                "10:30 AM" : 7,
                "11:00 AM" : 9,
                "11:30 AM" : 9,
                "12:00 PM" : 11,
                "12:30 PM" : 11,
                "1:00 PM" : 13,
                "1:30 PM" : 13,
                "2:00 PM" : 15,
                "2:30 PM" : 15,
                "3:00 PM" : 17,
                "3:30 PM" : 17,
                "4:00 PM" : 19,
                "4:30 PM" : 19,
                "5:00 PM" : 21,
                "5:30 PM" : 21,
                "6:00 PM" : 23,
                "6:30 PM" : 23,
                "7:00 PM" : 25,
                "7:30 PM" : 25,
                "8:00 PM" : 27,
                "8:30 PM" : 27,
                "9:00 PM" : 29
            };
            schedule.forEach(function(data){
                let startTime = data.start;
                let day = moment(startTime).format('dddd');
                let colNumber = col[day];
                row[day] = row[day]+3;
                let s1 = moment(data.start).format('LT');
                let s2 = moment(data.end).format('LT');
                let s3 = data.details.ta_name;
                let s4 = data.details.ta_email;
                let s5 = data.details.ta_type;
                let s6 = data.details.comment?data.details.comment:'';
                let rowNumber = slots[s1];
                let cellNumber = rowNumber + "" + colNumber;
                let overlap = "";
                if(worksheet.getCell(cellNumber).value !== null){
                    overlap = worksheet.getCell(cellNumber).value;
                }
                worksheet.getCell(cellNumber).value = overlap + "\n" + s1+' to '+s2+'\n'+s3+'\n'+s4+' - '+s5+'\n'+s6;
                worksheet.getCell(cellNumber).alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
                worksheet.getCell(cellNumber).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb:'0AD3F0'}
                };
            });
            // worksheet.getCell('A8').value = "10:00 am to 12:00pm \n Bharadwaj Parthasarathy bradthegame@gmail.com";
            // worksheet.getCell('B10').value = "10:00 am to 12:00pm \n Bharadwaj Parthasarathy \n bradthegame@gmail.com";
            // save workbook to disk
            worksheet.getRow(1).font = {bold:true};
            console.log("Done");
            //console.log(worksheet.getCell('A10').value);
            await workbook.xlsx.writeFile('samplefile.xlsx').then(function() {
                console.log("saved");
            });

            //fs.writeFileSync('./temp',schedule);

            res.download('./samplefile.xlsx','samplefile.xlsx');
            //res.send(resformat.res_format(false,'OK',req.params.courseid));
        }
        catch (e){
            res.status(500).send(resformat.res_format(true,'Error in download schedule',e.stack));
        }
    }
};