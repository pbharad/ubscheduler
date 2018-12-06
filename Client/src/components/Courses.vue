<template>
  <div class="section animated bounceInRight">
    <div class="column is-full">
      <div class="buttons has-addons is-right">
        <a class="button is-info" @click="addCourse">
          <span>Add Course</span>
        </a>
      </div>
    </div>
    <div class="columns is-multiline" style="padding:20px;">
    <div class="column is-one-third" :key="index" v-for="(data, index) in courses">

    <div class="card">
  <header class="card-header">
    <p class="card-header-title">
      {{data.course_name}} - {{data.course_semester}}
    </p>
    <a href="#" class="card-header-icon" aria-label="more options">
      <span class="icon">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
    </a>
  </header>
  <div class="card-content">
    <div class="content">
      <span class="has-text-weight-bold"> Description : </span> 
      <span> {{data.course_desc}} </span>
      <br>
      <span class="has-text-weight-bold"> Instructors : </span>
      <span> {{instrcutorsNames(data.instructors)}}</span>
    </div>
  </div>
  <footer class="card-footer">
    <a class="card-footer-item" @click="seeSchedule(data)">See Schedule</a>
    <a class="card-footer-item" @click="editCourse(data)">Edit</a>
    <a class="card-footer-item" @click="deleteCourse(data)">Delete</a>
  </footer>
</div>
</div>
<div v-if="courses.length === 0" style="width:50%; margin:0 auto;">
  <article class="message is-info" style="font-size:20px;">
  <div class="message-header">
    <p>No courses Available</p>
  </div>
  <div class="message-body">
    Looks like you don't have any course added yet. Click on the link below to get started.
    <br/>
    <a @click="addCourse"> <strong> Add course </strong></a>
  </div>
</article>
</div>
</div>

  </div>
</template>

<script>
import axios from 'axios';
import {globalMixin} from '../mixins/mixins';
export default{
  name:'Courses',
  mixins:[globalMixin],
  data(){
    return {
      courses:[]
    }
  },
  created(){
    this.getCourses();
  },
  methods:{
    getCourses: function(){
      var self = this;
      axios.get(this.$store.state.url+'user/courses/'+this.$session.get('id')).then(function(response){
        var courses = response.data.result;
        self.courses = JSON.parse(JSON.stringify(courses));
      }).catch(function(error){
        console.log("error : "+error);
      });
    },
    instrcutorsNames:function(data){
      var str = "";
      for(var i=0;i<data.length;i++){
        str = str + data[i].user_name;
        if(i != data.length-1){
          str = str + ", ";
        }
      }
      return str;
    },
    addCourse:function(){
      this.$router.push('/addcourse');
    },
    editCourse:function(data){
      this.$router.push('/editcourse/'+data.course_id);
    },
    seeSchedule:function(data){
      this.$router.push('/schedule/'+data.course_id);
    },
    deleteCourse:function(data){
      var self = this;
      if (confirm('Are you sure you want to delete this course. All associated data will be lost.'))
      {
        axios.delete(this.$store.state.url+'course/'+data.course_id).then(function(response){
        if(!response.data.error){
          self.displayNotification("Course Deleted Successfully", true);
          self.getCourses();
        }
        }).catch(function(error){
          console.log(error);
        });       
      }
    }
  }
}
</script>
