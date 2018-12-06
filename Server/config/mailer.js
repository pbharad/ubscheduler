let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'scheduling.framework@gmail.com',
        pass: 'schedulingframework123'
    }
});

module.exports = transporter;