
let environmentVar = require('../../environment');
let clientDomain = {
    //domain : 'http://schedulingframework-frontend.s3-website.us-east-2.amazonaws.com/?#/'
    domain:environmentVar.APP_SERVER_URL+'/#/'//'http://localhost:8080/?#/'
};

module.exports = clientDomain;