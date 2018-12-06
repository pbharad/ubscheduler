
module.exports = {
    res_format(error,message,data){
        this.error = error;
        this.result  = data || null;
        this.message  = message || 'OK';
        return this;
    }
};
