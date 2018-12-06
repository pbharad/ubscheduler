<template>
  <div>
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
          <div class="navbar-item"></div>
        </div>
      </div>
    </nav>
    <div class="section">
      <h1 class="title is-4"> TA Questionnaire</h1>
      <h5 class="subtitle is-5">*Kindly provide us with the time slots (with reason) that you do not want to be scheduled.*</h5>
      <!-- Acknowledgment Message -->
      <section class="hero is-primary" v-if="isAck">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">
              Thank You for Providing Your Availability!
            </h1>
            <h2 class="subtitle">
              <a class="button is-text" @click="isAck = false">Modify Submission</a>
            </h2>
          </div>
        </div>
      </section>
      <div class="columns is-multiline" v-if="!isAck">
        <div class="column is-full">
          <a class="button is-primary is-pulled-right is-clearfix" @click="submitAvailability()">Submit</a>
        </div>
        <div class="column is-full">
          <div class="columns">
            <div class="column is-one-fourth">
              <label class="label"> Course Name: {{this.courseName}}  </label>
              <label class="label"> Course Number: {{this.courseNumber}} </label>
              <label class="label "> Course Semester: {{this.courseSem}}  </label>
            </div>
          </div>
        </div>
        <div class="column is-full">
          <div class="columns">
            <div class="column is-4">
              <label class="label ">Maximum hours that I can work for in a week  <span style="color:red;"> * </span></label>
              <div class="control">
                <input class="input" type="number" v-model="maxHours" placeholder="15">
                <span class="dispText1 is-error is-danger" v-if="maxHoursError">{{errorMsg}}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Hard times -->
        <div class="column is-full">
          <label class="label ">I will not be available, </label>
          <div class="columns">
            <div class="column is-one-sixth">
              <label class="label "> From  </label>
            </div>
            <div class="column is-one-sixth">
              <label class="label "> To  </label>
            </div>
            <div class="column is-one-sixth">
              <label class="label "> On  </label>
            </div>
            <div class="column is-one-sixth">
              <label class="label "> Reason  </label>
            </div>
            <div class="column is-one-sixth">
              <label class="label "> Delete  </label>
            </div>
          </div>
          <div class="columns" v-for="(slot, ind) in hardSlots" :key="ind">
            <div class="column is-one-sixth">
              <div class="select">
                <select v-model="slot.start">
                  <option :value="data" v-for="(data, index) in timings" :key="index">{{data}}</option>
                </select>
              </div>
            </div>
            <div class="column is-one-sixth">
              <div class="select">
                <select v-model="slot.end">
                  <option :value="data" v-for="(data, index) in timings" v-if="index > timings.indexOf(slot.start)" :key="index">{{data}}</option>
                </select>
              </div>
            </div>
            <div class="column is-one-sixth">
              <div class="field has-addons">
                <div v-for="(data, index) in days" :key="index" :class="[slot.dates.indexOf(data.date) !== -1? 'is-primary':'','button']"
                    @click="includeHardDays(data, slot,ind);">{{data.name}}</div>
              </div>
            </div>
            <div class="column is-one-sixth">
              <div class="select">
                <select v-model="slot.reasonObject">
                  <option :value="data" v-for="(data, index) in reasons" :key="index">{{data.text}}</option>
                </select>
              </div>
              <div v-if="slot.reasonObject.type === 'soft'">
                <label class="label">Description</label>
                <div class="control">
                  <textarea class="textarea" v-model="slot.reason" rows="1"  placeholder=" eg. I don't like working at this time"></textarea>
                </div>
              </div>
            </div>
            <div class="column is-one-sixth">
              <p class="button is-danger content" @click="deleteHardTime(ind)">
                    <span class="icon is-small">
                      <v-icon name="trash"></v-icon>
                    </span>
              </p>
            </div>
          </div>
          <p class="button is-primary content" @click="addHardTime()">
                    <span class="icon is-small">
                      <v-icon name="plus-circle"></v-icon>
                    </span>
            <span>Add Slots</span>
          </p>
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
  name: "Questionnaire",
  data(){
    return{
      email:base64.decode(this.$route.params.email),
      courseid: this.$route.params.courseid,
      isAck:false,
      courseName:'',
      courseSem:'',
      courseNumber:'',
      maxHours:0,
      errorMsg:'',
      maxHoursError:false,
      hardSlots:[
        {
          'start':'08:00',
          'end':'10:00',
          'dates':[],
          'reasonObject':{
            'text':'I have class',
            'type':'hard'
          },
          'reason':''
        }
      ],
      softSlots:[

      ],
      reasons:[
        {'text':'I have class',
          'type':'hard'
        },
        {'text':'I have work',
          'type':'hard'
        },
        {
          'text':'Extra curricular activity',
          'type':'soft'
        },
        {'text':'Other reason',
          'type':'soft'
        }

      ],
      timings:[
        "08:00", "09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"
      ],
      days:[
        {
          'name':'Sun',
          'date':'2018-10-14',
          'checked':false
        },
        {
          'name':'Mon',
          'date':'2018-10-15',
          'checked':false
        },
        {
          'name':'Tue',
          'date':'2018-10-16',
          'checked':false
        },
        {
          'name':'Wed',
          'date':'2018-10-17',
          'checked':false
        },
        {
          'name':'Thu',
          'date':'2018-10-18',
          'checked':false
        },
        {
          'name':'Fri',
          'date':'2018-10-19',
          'checked':false
        },
        {
          'name':'Sat',
          'date':'2018-10-20',
          'checked':false
        }
      ]
    }
  },
  mounted(){
    this.email = base64.decode(this.$route.params.email);
    var self = this;
    axios.get(`${this.$store.state.url}ta/course/${this.$route.params.courseid}`).then(function(response){
      console.log(response);
      var result = response.data.result;
      self.courseName = result['course_name'];
      self.courseNumber = result['course_number'];
      self.courseSem = result['course_semester'];
    }).catch(function(error){
      console.log("error"+error);
    });
  },
  methods:{
    addHardTime(){
      var obj = {
        'start':'08:00',
        'end':'10:00',
        'dates':[],
        'reasonObject':{
          'text':'I have class',
          'type':'hard'
        },
        'reason':''
      };
      this.hardSlots.push(obj);
      console.log(this.hardSlots);
    },
    addSoftTime(){
      var obj = {
        'start':'08:00',
        'end':'10:00',
        'dates':[],
        'reason':''
      };
      this.softSlots.push(obj);
    },
    deleteHardTime(index){
      this.hardSlots.splice(index,1);
    },
    deleteSoftTime(index){
      this.softSlots.splice(index,1);
    },
    includeHardDays:function(data, slot, index){

      if(slot.dates.indexOf(data.date) === -1){
        slot.dates.push(data.date);
      }else{
        slot.dates.splice(slot.dates.indexOf(data.date),1);
      }
    },
    includeSoftDays:function(data, slot, index){

      if(slot.dates.indexOf(data.date) === -1){
        slot.dates.push(data.date);
      }else{
        slot.dates.splice(slot.dates.indexOf(data.date),1);
      }

    },
    validateAvailability(){
      var returnObj = {
        error:false
      };
      if(this.maxHours === 0){
        returnObj["error"] = true;
        returnObj["data"] = "maxHoursError";
        returnObj["message"] = "Maximum hours is required";
        return returnObj
      }
      if(this.maxHours > 40){
        returnObj["error"] = true;
        returnObj["data"] = "maxHoursError";
        returnObj["message"] = "Maximum hours cannot be greater than 40";
        return returnObj
      }
      return returnObj;
    },
    submitAvailability(){
      var self = this;
      var validate = this.validateAvailability();
      if(!validate.error){
        var hardSlotsList = [];
        var softSlotsList = [];
        this.hardSlots.forEach(function(slot){
          var start = slot.start;
          var end = slot.end;
          slot.dates.forEach(function(data){
            var obj = {};
            obj["start"] = data+"T"+start+":00";
            obj["end"] = data+"T"+end+":00";
            if(slot['reasonObject']['type'] === 'hard'){
              obj['reason'] = slot['reasonObject']['text'];
              hardSlotsList.push(obj);
            }
            else {
              obj['reason'] = slot['reason'];
              softSlotsList.push(obj);
            }
          });
        });

        var sendObj = {};
        sendObj['hard'] = hardSlotsList;
        sendObj['soft'] = softSlotsList;
        sendObj['max_hours'] = this.maxHours;
        console.log(sendObj);
        axios.post(`${this.$store.state.url}ta/${this.$route.params.email}/course/${this.courseid}`,{"availability":sendObj}).then(function(response){
          console.log(response);
          self.isAck = true;
        }).catch(function(error){
          console.log("error"+error);
        });
      }else{
        this.errorMsg = validate.message;
        this[validate.data] = true;
        setTimeout(function(){
          self[validate.data] = false;
        },3000);
      }

    }
  }
}
</script>

<style>
.is-error{
    color: #FF0000 !important;
}
</style>
