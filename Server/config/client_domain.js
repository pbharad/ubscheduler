
let environmentVar = require('../../environment');
let clientDomain = {
    /* For Deployment */
    domain:environmentVar.APP_SERVER_URL+'/#/'
    /* For developing in local machine use this (Port number might change) */
    //domain:'http://localhost:8080/?#/' 
};

module.exports = clientDomain;