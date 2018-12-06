let express = require('express');
let router = express.Router();

let userController = require('../controller/UserController');
let courseController = require('../controller/CourseController');
let TAController = require('../controller/TAController');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expr' });
});

/* GET REQUESTS */

// get the course list specific to a instructor.
router.get('/user/courses/:userid',userController.getCourse);

// get all the users for dropdown
router.get('/user',userController.getUsers);

// get the schedule specific to a course using course id
router.get('/course/schedule/:courseid',courseController.getSchedule);

// get all the course details (including instructor info and TA info)
router.get('/course/:courseid',courseController.getCourseInfo);

// get only the details about a course for TA questionnaire page
router.get('/ta/course/:courseid',TAController.getCourseDetails);

// Download schedule in xlsx format.
router.get('/course/schedule/download/:courseid',courseController.downloadSchedule);




/* POST REQUESTS */

// Insert or Update the schedule for a course
router.post('/course/schedule/:courseid',courseController.setSchedule);

// Insert/delete course related details like instructor info, TA info etc.
router.post('/course',courseController.addEditCourseInfo);

// Insert/update TA's availability obtained from questionnaire.
router.post('/ta/:taemail/course/:courseid',TAController.setTaAvailability);

// To send mail for resetting password
router.post('/forgotpassword',userController.forgotPassword);

// To reset password for a instructor
router.post('/resetpassword',userController.resetPassword);






/* DELETE REQUESTS */

// Delete a course
router.delete('/course/:courseid',courseController.deleteCourse);




module.exports = router;
