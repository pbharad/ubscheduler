<template>
    <div class="">
        <nav class="navbar is-black" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
            <a class="navbar-item">
            <span class="icon">
                <i class="fab fa-bitcoin" aria-hidden="true"></i>
            </span>
            </a>
            </div>
            <div class="navbar-menu">
            <div class="navbar-start">
                <a class="navbar-item">
            <h1 class="title" style="color:white;">
                Scheduling Framework
                </h1>
                </a>
            </div>
            <div class="navbar-end">
                <div class="navbar-item">

                </div>
            </div>
            </div>
        </nav>
        <div class="section">    
            <div v-if="linkExpired" style="width:50%; margin:0 auto;">
                <article class="message" style="font-size:20px;">
                <div class="message-header">
                    <p>Link Expired</p>
                </div>
                <div class="message-body">
                    Sorry. The Reset Password link you are trying to access has expired.
                    <br/>
                </div>
                </article>
            </div>
            <div class="box" v-if="!linkExpired">
                <h1 class="title is-4"> Reset Password</h1>
                <div class="columns is-multiline">
                    <div class="column is-full">
                        <div class="columns">
                            <div class="column is-one-third is-2">
                                <label class="label"> New Password </label>
                            </div>
                            <div class="column is-one-third is-3">
                                <input class="input" type="password" v-model="newPassword" placeholder="">
                                <span class="dispText1 is-error is-danger" v-if="passwordError">Passwords do not match</span>
                            </div>
                        </div>
                    </div>
                    <div class="column is-full">
                        <div class="columns">
                            <div class="column is-one-third is-2">
                                <label class="label"> Confirm Password </label>
                            </div>
                            <div class="column is-one-third is-3">
                                <input class="input" type="password" v-model="confirmNewPassword" placeholder="">
                                <span class="dispText1 is-error is-danger" v-if="passwordError">Passwords do not match</span>
                            </div>
                        </div>
                    </div>
                    <div class="column is-full">
                        <a @click="reset()" class="button is-info">Reset</a>
                        <span class="is-success">{{successMsg}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import base64 from 'base-64';
import moment from 'moment';
import axios from 'axios'
export default {
    name: "ResetPassword",
    data(){
        return {
            email:'',
            timestamp:'',
            linkExpired:false,
            newPassword:'',
            confirmNewPassword:'',
            passwordError:false,
            successMsg:''
        }
    },
    methods:{
        validateReset:function(){
            var returnObj = {
                "error":false
            };
            if(this.newPassword === '' || this.confirmNewPassword === '' || (this.newPassword !== this.confirmNewPassword)){
                returnObj["error"] = true;
                returnObj["data"] = "passwordError";
                return returnObj;
            }
            return returnObj
        },
        reset:function(){
            var validate = this.validateReset();
            var self = this;
            if(!validate.error){
                axios.post(this.$store.state.url+"resetpassword",{},{
                    auth:{
                        username: this.email,
                        password: this.newPassword
                    }
                }).then(function(response){
                    if(!response.data.error){
                        self.successMsg = "Password has been updated successfully. Please login with the new credentials."
                    }
                }).catch(function(error){

                });
            }else{
                this[validate.data] = true;
                setTimeout(function(){
                    self[validate.data] = false;
                },3000);
            }
        }
    },
    mounted(){
        this.email = base64.decode(this.$route.params.email);
        this.timestamp = this.$route.params.timestamp;
        var currentTimeStamp = moment();
        var expiringTimeStamp = moment.unix(this.timestamp);
        if(currentTimeStamp.isAfter(expiringTimeStamp)){
            this.linkExpired = true;
        }
    }
}
</script>
<style>
.is-error{
    color: #FF0000 !important;
}
.is-success{
    color: #32CD32 !important;
}
</style>
