<template>
  <div class="section animated bounceInRight">
    <div class="columns is-multiline">
      <div class="column is-full">
        <div class="buttons is-pulled-right">
          <span class="button is-info" @click="gotoSchedule()" v-if="viewSchedule">View Schedule</span>
          <span class="button is-info" @click="importTA()">Import TA</span>
          <span class="button is-info" @click="submitCourse()">Save</span></div>
      </div>
      <div class="column is-7">
        <div class="columns is-multiline">
          <div class="column is-4">
            <label class="label">Course Name <span style="color:red;"> * </span></label>
            <div class="control">
              <input class="input" type="text" v-model="courseDetails.course_name" placeholder="eg. Database Systems">
              <span class="dispText1 is-error is-danger" v-if="nameError">Course name cannot be empty</span>
            </div>
          </div>
          <div class="column is-4">
            <label class="label">Course Number <span style="color:red;"> * </span></label>
            <div class="control">
              <input class="input" type="text" v-model="courseDetails.course_number" placeholder="eg. CSE462/562">
              <span class="dispText1 is-error is-danger" v-if="numberError">Course number cannot be empty</span>
            </div>
          </div>
          <div class="column is-4">
            <label class="label">Course Term <span style="color:red;"> * </span> </label>
            <div class="control">
              <input class="input" type="text" v-model="courseDetails.course_semester" placeholder="eg. FALL2018">
              <span class="dispText1 is-error is-danger" v-if="semesterError">Course semester cannot be empty</span>
            </div>
          </div>
          <div class="column is-full">
            <label class="label">Course Description</label>
            <div class="control">
              <textarea class="textarea" v-model="courseDetails.course_desc" placeholder=""></textarea>
            </div>
          </div>

          <div class="column is-full">
            <label class="label">Instructors</label>
            <multiselect v-model="instructorDetails" placeholder="Search users" label="user_name" track-by="user_id" :options="options" :hideSelected="true" open-direction="top" :multiple="true" :searchable="true" @select="handleSelect" @remove="handleRemove"></multiselect>
            <span class="dispText1 is-error is-danger" v-if="instructorError">Course must have atleast one instructor</span>
            <span class="dispText1 is-error is-danger" v-if="instructorError1">You must be a part of the course</span>
          </div>
          <div class="column is-full">
            <label class="label">Course Slots</label>
            <div class="field">
              <input class="is-checkradio" id="multipleSection" type="checkbox" v-model="isMultipleSection">
              <label for="multipleSection">Multiple Sections</label>
            </div>
            <div class="columns is-full">
              <div class="column is-one-fifth">
                <label class="label"> Start </label>
              </div>
              <div class="column is-one-fifth">
                <label class="label"> End  </label>
              </div>
              <div class="column is-one-fifth">
                <label class="label"> Add this slot for  </label>
              </div>
              <div class="column is-one-fifth" v-if="isMultipleSection">
                <label class="label"> Section </label>
              </div>
            </div>
            <div class="columns is-full" v-for="(slot, ind) in slots" :key="ind">
              <div class="column is-one-fifth">
                <div class="select">
                  <select v-model="slot.start">
                    <option :value="data" v-for="(data, index) in timings" :key="index">{{data}}</option>
                  </select>
                </div>
              </div>
              <div class="column is-one-fifth">
                <div class="select">
                  <select v-model="slot.end">
                    <option :value="data" v-for="(data, index) in timings" :key="index">{{data}}</option>
                  </select>
                </div>
              </div>
              <div class="column is-one-fifth">
                <div class="select">
                  <select v-model="slot.date">
                    <option :value="index" v-for="(data, index) in dates" :key="index">{{data}}</option>
                  </select>
                </div>
              </div>
              <div class="column is-one-fifth" v-if="isMultipleSection">
                <div class="select">
                  <select v-model="slot.sec_id">
                    <option :value="data" v-for="(data, index) in sections" :key="index">{{data}}</option>
                  </select>
                </div>
              </div>
              <div class="column is-one-fifth">
                <p class="button is-danger content" @click="deleteSlot(ind)">
                  <span class="icon is-small">
                    <v-icon name="trash"></v-icon>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="column is-full">
            <p class="button is-info content" @click="addSlot()">
                <span class="icon is-small">
                  <v-icon name="plus-circle"></v-icon>
                </span>
                <span>Add slot</span>
            </p>
            <p v-if="action === 'add'" class="label">Note: All TAs added here will be sent out an email with a link to the Questionnaire</p>
          </div>
        </div>
      </div>
      <div class="column is-two-fourth">
        <section class="accordions">
            <span class="dispText1 is-error is-danger" v-if="taError">There must be atleast one TA associated to the course</span>
            <article v-for="(data, index) in taDetails" :key="index" :class="[data.isActive?'is-active':'','accordion']">

              <div class="accordion-header" style="cursor:pointer;">
                <span class="" @click="collapse(data)" style="width:95%;">
                  <p> {{data.ta_name}}</p>
                </span>
                <span class="icon" style="width:5%;" @click="deleteTA(index);">
                  <v-icon name="trash"></v-icon>
                </span>
              </div>
              <div class="accordion-body">
                <div class="accordion-content columns is-multiline">
                  <div class="column is-4"><label class="label is-small2">Name</label> </div><div class="column is-half is-customPadding"> <input type="text" placeholder="" v-model="data.ta_name" class="input is-customappcolor displayTextCenter600"></div>
                  <div class="column is-4"><label class="label is-small2">Email</label> </div><div class="column is-half is-customPadding"> <input type="text" placeholder="" v-model="data.ta_email" class="input is-customappcolor displayTextCenter600"></div>
                  <div class="column is-4"><label class="label is-small2">Type</label></div><div class="field has-addons column is-half is-customPadding"><div :class="[data.ta_type==='UTA'?'is-info':'','button']" @click="switchTaType('UTA',data)">UTA</div> <div :class="[data.ta_type==='GTA'?'is-info':'','button']" @click="switchTaType('GTA',data)">GTA</div></div>
                </div>
              </div>
            </article>
          </section>
          <br/>
          <p class="button is-info content" @click="addTA()">
                <span class="icon is-small">
                  <v-icon name="plus-circle"></v-icon>
                </span>
                <span>Add TA</span>
          </p>
      </div>
    </div>
    <modal v-if="showImportModal" v-on:close="closeModal">
          <p slot="header" class="modal-card-title">Import Details</p>
          <div slot="content" class="content">
            <div class="columns is-multiline">
              <div class="column is-full">
                <h6 class="label"> Please download the template from the given link and upload after entering the TA details.</h6>
              </div>
              <div class="column is-full">
                <a href="https://docs.google.com/spreadsheets/d/1Vvpqg_zsSkRErESHsAY7YwGkD0tAzCKS-eQgvnOz0sk/export?format=csv">
                template</a>
                <br>
                <br>
                <label class="label"> Note : </label>
                <p class="label">
                  Do not change the Headers Name, Email and Type.
                </p>
            </div>
          </div>
          </div>
          <div slot="footer" class="file">
            <label class="file-label">
              <input class="file-input" type="file" @change="filesChange($event.target.name, $event.target.files, $event)">
              <span class="file-cta">
                <span class="file-icon">
                  <i class="fas fa-upload"></i>
                </span>
                <span class="file-label">
                  Upload…
                </span>
              </span>
            </label>
          </div>
      </modal>
  </div>
</template>
<script>
import axios from 'axios'
import modal from './Modal';
import {globalMixin} from '../mixins/mixins';
export default{
  name:'addCourse',
  mixins:[globalMixin],
  components:{modal},
  data(){
    return{
      taDetails:[
        {
          "ta_name":"TA1",
          "ta_email":"",
          "rules":{},
          "ta_type":"UTA",
          "isActive":true
        },
        {
          "ta_name":"TA2",
          "ta_email":"",
          "rules":{},
          "ta_type":"GTA",
          "isActive":false,
        },
        {
          "ta_name":"TA3",
          "ta_email":"",
          "rules":{},
          "ta_type":"GTA",
          "isActive":false,
        }
      ],
      courseDetails:{
        course_id:-1,
        course_name:'',
        course_semester:'',
        course_number:'',
        course_desc:'',
        course_rules:[]
      },
      instructorDetails:[
      ],
      options: [],
      action:'add',
      courseID:-1,
      taDeletedList:[],
      instructorDetailsCopy:[],
      instructorInsertList:[],
      instructorDeleteList:[],
      slots:[
        {
          'start':'08:00',
          'end':'14:00',
          'date':'2018-10-14',
          'sec_id':'Section 1'
        }
      ],
      timings:[
        "08:00", "09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"
      ],
      dates:{
        '2018-10-14':'Sunday',
        '2018-10-15':'Monday',
        '2018-10-16':'Tuesday',
        '2018-10-17':'Wednesday',
        '2018-10-18':'Thursday',
        '2018-10-19':'Friday',
        '2018-10-20':'Saturday'
      },
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
      ],
      showImportModal: false,
      nameError:false,
      numberError:false,
      semesterError:false,
      instructorError:false,
      instructorError1:false,
      taError:false,
      isMultipleSection:true,
      viewSchedule:false,
      sections:[
        'Section 1',
        'Section 2',
        'Section 3',
        'Section 4',
        'Section 5',
      ],
      sectionColors:{
        'Section 1':'#F8C471',
        'Section 2':'#03F7F7',
        'Section 3':'#D7BDE2',
        'Section 4':'#F2D7D5',
        'Section 5':'#D4E6F1'
      }
    }
  },
  created(){
    var self = this;
    this.fetchUsers();
    if(this.$route.params.id !== undefined && this.$route.params.id !== "undefined"){
      var courseId = this.$route.params.id;
      this.action = 'edit';
      this.courseID = courseId;
      axios.get(this.$store.state.url+"course/"+courseId).then(function(response){
          console.log(response);
          var details = response.data.result;
          self.courseDetails = details.courseDetails;
          self.slots = self.courseDetails.course_rules;
          self.instructorDetails = details.instructorDetails;
          details.taDetails.forEach(function(det){
            det["isActive"] = false;
          });
          self.taDetails = details.taDetails;
          self.populateDetails();
          self.viewSchedule = true;
      });
    }else{
      console.log(self.$session.get('userDetails'));
      self.instructorDetails.push(self.$session.get('userDetails'));
    }
  },
  methods:{
    collapse:function(data){
      this.taDetails.forEach(function(ta){
        if(ta.ta_name !== data.ta_name){
          ta["isActive"] = false;
        }
      });
      data.isActive = !data.isActive;
    },
    deleteTA:function(index){
      console.log(this.taDetails);
      var taObj = (this.taDetails.splice(index, 1))[0];
      if(this.action === 'edit'){
        console.log(taObj);
        if(!taObj.added){
          this.taDeletedList.push(taObj);
          console.log(this.taDeletedList);
        }
      }
    },
    addTA:function(){
      var newObj = {};
      this.taDetails.forEach(function(ta){
          ta.isActive = false;
      });
      newObj["ta_name"] = "TA"+(this.taDetails.length+1);
      newObj["ta_email"] = "";
      newObj["rules"] = {};
      newObj["ta_type"] = "GTA";
      newObj["isActive"] = true;
      if(this.action === 'edit'){
        newObj["added"] = true;
      }
      this.taDetails.push(newObj);
    },
    importTA: function(){
      this.showImportModal = true;
    },
    closeModal: function(){
      this.showImportModal = false;
    },
    /* Upload csv file to import TA data */
    filesChange: function(name, file, event){
      var self = this;
      var reader = new FileReader();
      reader.readAsText(file[0]);
      reader.onload = function(event) {
          console.log(event.target.result);
          var csv = event.target.result;
          var lines = csv.split("\n");
          var result = [];
          var headers=lines[0].split(",");
          console.log(lines.length);
          for(var i=1;i<lines.length;i++){
            var obj = {};
            var currentline=lines[i].split(",");
            if(currentline.length === 3) {
              console.log(currentline);
              obj["ta_name"] = currentline[0].trim();
              obj["ta_email"] = currentline[1].trim();
              obj["ta_type"] = currentline[2].trim();
              obj["rules"] = {}
              obj["isActive"] = false;
              console.log(obj);
              result.push(obj);
            }
          }
          self.taDetails = JSON.parse(JSON.stringify(result));
          self.showImportModal = false;
          console.log(self.taDetails);
      };
      reader.onerror = function() {
          alert('Unable to read ' + file.fileName);
      };
    },
    switchTaType: function(type, data){
      data.ta_type = type;
    },
    includeDays:function(data, slot, index){
      if(slot.dates.indexOf(data.date) == -1){
        slot.dates.push(data.date);
      }else{
        slot.dates.splice(slot.dates.indexOf(data.date),1);
      }
    },
    addSlot: function(){
      this.slots.push({
          'start':'08:00',
          'end':'14:00',
          'date':'2018-10-14',
          'sec_id':'Section 1'
        });
    },
    deleteSlot: function(index){
      this.slots.splice(index, 1);
    },
    fetchUsers: function(){
      var self = this;
      axios.get(this.$store.state.url+'user').then(function(response){
        self.options = response.data.result;
        console.log(self.options);
      }).catch(function(error){
        console.log("error : "+error);
      });
    },
    handleRemove: function(option){
      if(this.action === 'edit'){
        var found = false;
        for(var i=0;i<this.instructorDetailsCopy.length;i++){
          if(this.instructorDetailsCopy[i].user_id === option.user_id){
            found = true;
            this.instructorDetailsCopy[i]["deleted"] = true;
            break;
          }
        }
        if(!found){
          for(var j=0;j<this.instructorInsertList.length;i++){
            if(this.instructorInsertList[j] === option.user_id){
              this.instructorInsertList.splice(j, 1);
              break;
            }
          }
        }
      }

    },
    handleSelect: function(option){
      if(this.action === 'edit'){
        var found = false;
        for(var k=0;k<this.instructorDetailsCopy.length;k++){
          if(this.instructorDetailsCopy[k].user_id === option.user_id){
            found = true;
            this.instructorDetailsCopy[k]["deleted"] = false;
            break;
          }
        }
        if(!found){
          this.instructorInsertList.push(option.user_id);
        }
      }
    },
    populateDetails: function(){
      var self = this;
      self.instructorDetails.forEach(function(data){
        data["deleted"] = false;
        self.instructorDetailsCopy.push(data);
      });
    },
    /* Method to validate course details */
    validateCourse: function(){
      var self = this;
      var returnObj = {
        error : false
      };
      //Course Details
      if(this.courseDetails.course_name === ''){
        returnObj["error"] = true;
        returnObj["data"] = "nameError";
        return returnObj;
      }
      if(this.courseDetails.course_number === ''){
        returnObj["error"] = true;
        returnObj["data"] = "numberError";
        return returnObj;
      }
      if(this.courseDetails.course_semester === ''){
        returnObj["error"] = true;
        returnObj["data"] = "semesterError";
        return returnObj;
      }
      //Instructor Details
      if(this.instructorDetails.length === 0){
        returnObj["error"] = true;
        returnObj["data"] = "instructorError";
        return returnObj;
      }
      var currentUser = this.$session.get('userDetails').user_id;
      var found = false;
      for(var i=0;i<self.instructorDetails.length;i++){
        if(currentUser === self.instructorDetails[i].user_id){
          found = true;
          break;
        }
      }
      if(!found){
        returnObj["error"] = true;
        returnObj["data"] = "instructorError1";
        return returnObj;
      }
      //TA details
      if(self.taDetails.length === 0){
        returnObj["error"] = true;
        returnObj["data"] = "taError";
        return returnObj;
      }
      return returnObj;
    },
    /* Method to save course changes */
    submitCourse: function(){
      var self = this;
      var validate = this.validateCourse();
      if(validate.error){
        self.displayNotification('Check errors below', false);
        this[validate.data] = true;
        setTimeout(function(){
          self[validate.data] = false;
        }, 5000);
      }
      else{
        var finalObj = {};
        finalObj["instructorDetails"] = {
          "insert":[],
          "remove":[]
        };
        finalObj["taDetails"] = {
          "insert":[],
          "remove":[]
        };
        if(this.action === 'edit'){
          var instructorRemove = [];
          this.instructorDetailsCopy.forEach(function(data){
            if(data.deleted != undefined && data.deleted != null && data["deleted"]){
              instructorRemove.push(data.user_id);
            }
          });
          finalObj.instructorDetails.insert = self.instructorInsertList;
          finalObj.taDetails.insert = self.taDetails;
          finalObj.instructorDetails.remove = instructorRemove;
          finalObj.taDetails.remove = self.taDeletedList;
        }else{
          var list = [];
          self.instructorDetails.forEach(function(data){
            list.push(data.user_id);
          });
          finalObj.instructorDetails.insert = list;
          finalObj.taDetails.insert = self.taDetails;
        }
        //course slots
        var slotObj = [];
        self.slots.forEach(function(slot){
          var obj={};
          obj["sec_id"] = "Section 1";
          if(self.isMultipleSection){
            obj["sec_id"] = slot.sec_id;
          }
          var start = slot.start;
          var end = slot.end;
          obj["start"] = slot.date+"T"+slot.start+":00";
          obj["end"] = slot.date+"T"+slot.end+":00";
          obj["color"] = self.sectionColors[slot.sec_id];
          slotObj.push(obj);
        });
        console.log(slotObj);
        this.courseDetails.course_rules = slotObj;
        finalObj["courseDetails"] = this.courseDetails;
        axios.post(self.$store.state.url+'course',finalObj).then(function(response){
          if(!response.data.error){
            self.viewSchedule = true;
            self.courseID = response.data.result.course_id;
            console.log("brad");
            console.log(self.courseID);
            if(self.action === 'add'){
              self.displayNotification("Course added successfully. Email has been sent to the TAs added", true);
            }else{
              self.displayNotification("Course updated successfully", true);
            }
          }
        }).catch(function(error){
          console.log(error);
        });
      }
    },
    gotoSchedule: function(){
      if(this.viewSchedule){
        this.$router.push('/schedule/'+this.courseID);
      }
    }
  }
}
</script>
<style>
.is-error{
    color: #FF0000 !important;
}
.multiselect.invalid .multiselect__tags,  
.multiselect.invalid .multiselect__tags span,
.multiselect.invalid .multiselect__tags input,
.multiselect__tag{
  background:#209cee;
}
</style>
