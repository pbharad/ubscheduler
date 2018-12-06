<template>
  <section class="hero is-success is-fullheight">
        <div class="hero-body">
            <div class="container has-text-centered">
                <div class="column is-4 is-offset-4">
                    <h3 class="title has-text-grey">{{header}}</h3>
                    <p class="subtitle has-text-grey">{{text}}</p>
                    <div class="box animated bounceInLeft" v-if="isLogin">
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="email" v-model="email"  placeholder="Your Email" autofocus="">
                                <span class="dispText1 is-error is-danger" v-if="emailError">Please enter a valid email Id</span>
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="password" v-model="password" placeholder="Your Password">
                                <span class="dispText1 is-error is-danger" v-if="passwordError">Please enter a valid password</span>
                            </div>
                        </div>
                    </div>
                    <div class="box animated bounceInLeft" v-if="isSignUp">
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="email" v-model="signUpDetails.email"  placeholder="Your Email" autofocus="">
                                <span class="dispText1 is-error is-danger" v-if="emailError">Please enter a valid email</span>
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="name" v-model="signUpDetails.name"  placeholder="Your Name" autofocus="">
                                <span class="dispText1 is-error is-danger" v-if="nameError">Please enter a valid Name</span>
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="password" v-model="signUpDetails.password" placeholder="Your Password">
                                <span class="dispText1 is-error is-danger" v-if="passwordError">Passwords do not match</span>
                            </div>
                        </div>
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="password" v-model="signUpDetails.confirmPassword" placeholder="Confirm Password">
                                <span class="dispText1 is-error is-danger" v-if="passwordError">Passwords do not match</span>
                            </div>
                        </div>
                    </div>
                    <div class="box animated bounceInLeft" v-if="isForgotPassword">
                        <div class="field">
                            <div class="control">
                                <input class="input is-large" type="email" v-model="forgotPasswordEmail"  placeholder="Your Email" autofocus="">
                                <span class="dispText1 is-error is-danger" v-if="forgotPasswordEmailError">Please enter a valid email Id</span>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="button is-block is-info is-large is-fullwidth" @click="login" v-if="isLogin">Login</button>
                    <button type="button" class="button is-block is-info is-large is-fullwidth" @click="signUp" v-if="isSignUp">Sign Up</button>
                    <button type="button" class="button is-block is-info is-large is-fullwidth" @click="resetPassword" v-if="isForgotPassword">Reset</button>
                    <p class="">
                        <br>
                        <a class="button is-select" @click="showSignUp" v-if="isLogin || isForgotPassword">Sign Up</a> &nbsp;
                        <a class="button is-select" @click="showLogin" v-if="isSignUp || isForgotPassword">Login</a> &nbsp;
                        <a class="button is-select" @click="showForgotPassword" v-if="isLogin || isSignUp"> Forgot Password </a> &nbsp;
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import axios from 'axios';
import {globalMixin} from '../mixins/mixins';
export default {
  name: 'HelloWorld',
  mixins:[globalMixin],
  data () {
    return {
      email : '',
      password : '',
      emailError: false,
      passwordError:false,
      nameError:false,
      signUpDetails:{
          email:'',
          name:'',
          password:'',
          confirmPassword:''
      },
      forgotPasswordEmail:"",
      forgotPasswordEmailError:false,
      isSignUp: false,
      isLogin:true,
      isForgotPassword:false,
      header:'Login',
      text:'Please Login to procees'
    }
  },
  methods:{
    showSignUp: function(){
      this.header = "Sign Up";
      this.text = "Please enter your details to sign up";
      this.isSignUp = true;
      this.isLogin = false;
      this.isForgotPassword = false;
    },
    showLogin: function(){
      this.header = "Login";
      this.text = "Please Login to proceed";
      this.isSignUp = false;
      this.isLogin = true;
      this.isForgotPassword = false;
    },
    showForgotPassword: function(){
      this.header = "Reset Password";
      this.text = "";
      this.isSignUp = false;
      this.isLogin = false;
      this.isForgotPassword = true;
    },
    validateLogin: function(){
        var returnObj = {
            error : false
        };
        
        if(this.email === "" || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email))){
            returnObj["error"] = true;
            returnObj["data"] = "emailError";
            return returnObj;
        }
        if(this.password === ""){
            returnObj["error"] = true;
            returnObj["data"] = "passwordError";
            return returnObj;
        }
        return returnObj;
    },
    validateSignUp:function(){
        var returnObj = {
            error:false
        };
        if(this.signUpDetails.email === '' || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.signUpDetails.email))){
            returnObj["error"] = true;
            returnObj["data"] = "emailError";
            return returnObj;
        }
        if(this.signUpDetails.name === ''){
            returnObj["error"] = true;
            returnObj["data"] = "nameError";
            return returnObj;
        }
        if(this.signUpDetails.password === '' || this.signUpDetails.confirmPassword === '' || (this.signUpDetails.password !== this.signUpDetails.confirmPassword)){
            returnObj["error"] = true;
            returnObj["data"] = "passwordError";
            return returnObj;
        }
        return returnObj;
    },
    validateResetPassword:function(){
        var returnObj = {
            error:false
        };
        if(this.forgotPasswordEmail === '' || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.forgotPasswordEmail))){
            returnObj["error"] = true;
            returnObj["data"] = "forgotPasswordEmailError";
            return returnObj;
        }
        return returnObj;
    },
    signUp: function(){
      var self = this;
      var validate = this.validateSignUp();
      console.log(validate);
      if(!validate.error){ //validation
        //sign up axios call

        axios.post(this.$store.state.url+'signup',{
          user_name:self.signUpDetails.name
        },{
          auth:{
            username: self.signUpDetails.email,
            password:self.signUpDetails.password
          }
        }).then(function(response){
            console.log(response);
             if(!response.data.error){
               console.log('auth passed');
               self.$session.start();
               //self.fetchUsers();
               self.$session.set("id",response.data.result.user_id);
               self.$session.set("userDetails",response.data.result);
               self.$router.push('/courses');
            }else{
                console.log("error in authentication");
                console.log(response.data.error);
                self.displayNotification(response.data.message, false);
            }
         }).catch(function(error){
          console.log("error : "+error);
         });
        console.log(this.signUpDetails);
      } else{
          this[validate.data] = true;
          setTimeout(function(){
              self[validate.data] = false;
          },3000);
      }
    },
    resetPassword: function(){
        var validate = this.validateResetPassword();
        var self = this;
        if(!validate.error){
            axios.post(this.$store.state.url+"forgotpassword",{instructor_email:self.forgotPasswordEmail}).then(function(response){
                if(!response.data.error){
                    self.text = "An email with the link to reset password has been sent to your email";
                }else{
                    self.displayNotification(response.data.message, false);
                }
            }).catch(function(error){
                console.log("error : " +error);
            });
        
            //send request to backend
        }else{
            this[validate.data] = true;
            setTimeout(function(){
              self[validate.data] = false;
            },3000);
        }
    },
    login: function(){
        var self = this;
        var validate = this.validateLogin();
        if(!validate.error){
            axios.post(this.$store.state.url+'login',{},{
            auth:{
                username: self.email,
                password:self.password
            }
            }).then(function(response){
                console.log(response);
            if(!response.data.error){
                console.log("success");
                self.$session.start();
                //self.fetchUsers();
                self.$session.set("id",response.data.result.user_id);
                self.$session.set("userDetails",response.data.result);
                self.$router.push('/courses');
            }else{
                console.log("error");
                self.displayNotification("Invalid username or password", false);
            }
            }).catch(function(error){
                console.log("preflight error");
            console.log("error : "+error);
            });
        }else{
            this[validate.data] = true;
            setTimeout(function(){
              self[validate.data] = false;
            },3000);
        }      
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hero.is-success {
  background: white;
}
.hero .nav, .hero.is-success .nav {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.box {
  margin-top: 5rem;
}
.avatar {
  margin-top: -70px;
  padding-bottom: 20px;
}
.avatar img {
  padding: 5px;
  background: #fff;
  border-radius: 50%;
  -webkit-box-shadow: 0 2px 3px rgba(10,10,10,.1), 0 0 0 1px rgba(10,10,10,.1);
  box-shadow: 0 2px 3px rgba(10,10,10,.1), 0 0 0 1px rgba(10,10,10,.1);
}
input {
  font-weight: 300;
}
p {
  font-weight: 700;
}
p.subtitle {
  padding-top: 1rem;
}
.is-error{
    color: #FF0000 !important;
}

</style>
