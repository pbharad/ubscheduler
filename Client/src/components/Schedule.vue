<template>
  <div class="section animated bounceInRight">
    <div class="columns is-multiline">
      <div class="column is-full">
          <div class="buttons is-pulled-right">
            <span class="button is-info" @click="gotoAddEdit">Edit Course</span>
            <span class="button is-info" @click="saveSchedule(true)">Export as xls</span>
            <span class="button is-info" @click="saveSchedule(false)">Save</span>
          </div>
      </div>
      <!-- course details -->
      <div class="column is-full">
        <div class="is-pulled-left column is-5" style="text-align:left;">
          <a class="button is-small" style="border:1px solid #FF0000; width:5%"></a>
          <span>Availability not provided</span> &nbsp;&nbsp;
          <a class="button is-small" style="border:1px solid #32CD32; width:5%"></a>
          <span>Availability provided</span>
          <a class="button is-small" style="background:rgb(6, 188, 243); width:5%"></a>
          <span>Course Slots</span>
        </div>
        <div class="is-pulled-left column is-4" style="text-align:left;" v-if="showConstraintsLegend">
          <a class="button is-small" style="background:#ff9f89; width:5%"></a>
          <span>Hard Constraints</span> &nbsp;&nbsp;
          <a class="button is-small" style="background:#FFFF00; width:5%"></a>
          <span>Soft Constraints</span>
        </div>  
        <p class="label is-pulled-right" style="text-align:right;">
          Course : {{courseData['course_name']}} - {{courseData['course_number']}} <br>
          Semester : {{courseData['course_semester']}} <br>
          <span class="has-text-weight-bold"> Instructors : {{instructorNames(instructorData)}}</span>
        </p>
      </div>
      <div class="columns">
        <div class="column is-one-fourth" style="margin-top:30px; position:relative;">
          <div class="columns is-multiline" id="ta">
            <div class="column is-full">
              <label class="label">Drag and Drop TAs to generate your schedule</label>
            </div>
          </div>
          <!-- <div class="column is-full">
            <a class="button is-info" @click="clearData">Clear Data </a>
          </div> -->
        </div>
        <div class="column is-6">
          <full-calendar :config="config"
            :events="events"
            @event-drag="handleEventDragStart"
            @event-dragStop="handleEventDragStop"
            @event-receive="handleExternalDrop"
            @event-selected="eventClick"
            @event-drop="handleInternalDrop"
            @event-resize="handleResize"
            @event-all-render="eventAfterAllRender"
            @event-resize-start="handleEventResizeStart"/>
        </div>
        <div class="column" style="margin-top:35px;">
          <div class="columns is-multiline">
            <div class="column is-full">
              <section class="accordions" style="overflow: hidden;">
                <article class="accordion">
                  <div class="accordion-header" style="cursor:pointer;">
                    <span class="" @click="collapse()" style="width:95%;">
                      <p>Course Slots </p>
                    </span>
                  </div>
                  <div class="accordion-body" v-if="showSlots" style="max-height:400px; overflow-x:hidden;overflow-y:auto;">
                    <div class="accordion-content columns is-multiline">
                      <div class="columns is-multiline is-full" v-for="(data, index, key) in courseRules" :key="key" v-if="data.length > 0">
                        <div class="column is-full">
                          <label class="label"> {{index}} </label>
                        </div>
                        <div class="column is-full" v-for="(time, ind) in data" :key="ind">
                          <a class="button" @click="highlight(time)">{{time.sec_id}} - {{time.start}} to {{time.end}} </a>
                        </div>
                      </div>
                      <div class="columns is-multiline is-full" v-if="!isCourseSlotAvailable()">
                        <div class="column is-full">
                          <label class="label"> No Course Slots </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            </div>
            <div class="column is-full"> 
              <section class="accordions">
                <article class="accordion">
                  <div class="accordion-header" style="cursor:pointer;">
                    <span class="" @click="collapseViolations()" style="width:95%;">
                    <p>Violations </p></span>
                  </div>
                  <div class="accordion-body" v-if="showViolations" style="max-height:400px; overflow-x:hidden;overflow-y:auto;">
                    <div class="accordion-content columns is-multiline">
                      <div class="column is-full" v-for="(data, index) in violationList" :key="index">
                        <div class="columns is-multiline" style="padding:0.50rem;">
                          <div class="column is-1">
                            <span class="panel-icon" style="color:red; line-height:2rem;vertical-align:middle;">
                              <v-icon name="times"></v-icon>
                            </span>
                          </div>
                          <div class="column">
                            <span>{{getDay(data.start)}} - {{getTime(data.start)}} to {{getTime(data.end)}}</span>
                            <br>
                            <span>{{data.details.ta_name}} - {{data.reason}}</span>
                          </div>
                        </div>
                      </div>
                      <div class="column is-full" v-if="violationList.length === 0">
                        <div class="box columns is-multiline" style="padding:0.50rem;">
                          <div class="column">
                            <span>No Violations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            </div>
          </div>
        </div>
      </div>
      <modal v-if="showModal" v-on:close="closeModal">
          <p slot="header" class="modal-card-title">Class Schedule</p>
          <div slot="content" class="content">
            <div class="columns is-multiline">
              <div class="column is-full">
                <h6 class="label"> {{displayObj.day}} - {{displayObj.start}} to {{displayObj.end}}</h6>
              </div>
              <div class="column is-full">
                <div class="columns">
                  <div class="column is-3">
                    <label class="label">TA Name : </label>
                  </div>
                  <div class="column is-3">
                    <label class="label">{{displayObj.details.ta_name}}</label>
                  </div>
                </div>
              </div>
              <div class="column is-full">
                <div class="columns">
                  <div class="column is-3">
                    <label class="label">TA Email : </label>
                  </div>
                  <div class="column is-3">
                    <label class="label">{{displayObj.details.ta_email}}</label>
                  </div>
                </div>
              </div>

              <div class="column is-full">
                <div class="columns">
                  <div class="column is-3">
                    <label class="label">TA Type : </label>
                  </div>
                  <div class="column is-3">
                    <label class="label">{{displayObj.details.ta_type}}</label>
                  </div>
                </div>
              </div>

              <div class="column is-full">
                <div class="columns">
                  <div class="column is-3">
                    <label class="label">Comments : </label>
                  </div>
                  <div class="column is-half">
                    <textarea class="textarea" v-model="eventComment" ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a slot="footer" class="button is-primary" @click="saveEvent(displayObj)">Save</a>
          <a slot="footer" class="button is-danger" @click="deleteEvent(selectedEvent)">Delete</a>

      </modal>

      <modal v-if="showErrorModal" v-on:close="cancelOverride(errorObj)">
          <p slot="header" class="modal-card-title">Violation</p>
          <div slot="content" class="content">
            <div class="columns is-multiline">
              <div class="column is-full">
                <h6 class="label"> {{errorObj.start.format('dddd')}} - {{errorObj.start.format('LT')}} to {{errorObj.end.format('LT')}}</h6>
              </div>
              <div class="column is-full">
                <p>
                  This slot is not available for {{errorObj.details.ta_name}}
                </p>
                <br>
                <label class="label"> Reason : </label>
                <br>
                <p>
                  {{errorObj.reason}}
                </p>
            </div>
          </div>
          </div>
          <a slot="footer" class="button is-primary" @click="override(errorObj)">Override</a>
          <a slot="footer" class="button is-primary" @click="cancelOverride(errorObj)">Cancel</a>
      </modal>
    </div>
  </div>

</template>

<script>
  import moment from 'moment';
  import axios from 'axios';
  import $ from 'jquery';
  import modal from './Modal';
  import fullCalendar from './FullCalendar';
  import {globalMixin} from '../mixins/mixins';
  export default {
    name: 'Schedule',
    components:{modal, fullCalendar},
    mixins:[globalMixin],
    data () {
      return {
        eventsData:[],
        events: [
        ],
        slotEvents:[],
        courseData:[],
        instructorData:[],
        eventComment:'',
        showSlots:true,
        showViolations:true,
        violatedData:null,
        violationList:[],
        internalEvent:null,
        taAvailability:{},
        dummyEvents:[],
        eventObj:{},
        taDetails:[],
        courseId:-1,
        config: {
          defaultView: 'agenda',
          allDaySlot: false,
          selectable:false,
          minTime: "08:00:00",
          maxTime:"22:00:00",
          timeFormat:'hh:mm',
          visibleRange: {
            start:'2018-10-14',
            end:'2018-10-21'
          },
          editable:true,
          droppable:true,
          header:{
            left:'',
            right:'',
            center:''
          },
          aspectRatio:1.8,
          selectHelper:true,
          height:'auto',
          handleWindowResize:true,
          columnHeaderText: function(mom) {
            if (mom.weekday() === 0)
              return 'Sunday';
            if (mom.weekday() === 1)
              return 'Monday';
            if (mom.weekday() === 2)
              return 'Tuesday';
            if (mom.weekday() === 3)
              return 'Wednesday';
            if (mom.weekday() === 4)
              return 'Thursday';
            if (mom.weekday() === 5)
              return 'Friday';
            if (mom.weekday() === 6)
              return 'Saturday';
          },
        },
        courseRules:{
          'Monday':[],
          'Tuesday':[],
          'Wednesday':[],
          'Thursday':[],
          'Friday':[],
          'Saturday':[],
          'Sunday':[]
        },
        selectedEvent:{},
        displayObj:{},
        showModal:false,
        showErrorModal:false,
        errorObj:{},
        showConstraintsLegend:false
      }
    },

    methods:{
      highlight(data){
        var events = $('#calendar').fullCalendar('clientEvents');
          events.forEach(function(event){
          if(event.rendering === 'background' && event.key !== undefined && event.key !== null){
            if(event.key === data.key){
              if(data.toggle === null || data.toggle === undefined || data.toggle === false){
               data["toggle"] = true;
               event.backgroundColor = '#000000'; 
              }else{
                data["toggle"] = false;
                event.backgroundColor = 'rgb(6, 188, 243)';
              }
              $('#calendar').fullCalendar('updateEvent',event);
            }
          }
        });
      },
      collapse(){
        this.showSlots = !this.showSlots;
      },
      gotoAddEdit(){
        this.$router.push('/editcourse/'+this.courseId);
      },
      instructorNames:function(data){
        var str = "";
        for(var i=0;i<data.length;i++){
          str = str + data[i].user_name;
          if(i != data.length-1){
            str = str + ", ";
          }
        }
        return str;
      },
      collapseViolations(){
        this.showViolations = !this.showViolations;
      },
      /* This method gets triggered when the user starts dragging an internal event (already in the calendar) */
      handleEventDragStart(event, jsEvent, ui, view){
        this.internalEvent = event;
      },
      /* This method gets triggered when the user stops to dragging an internal event (already in the calendar) */
      handleEventDragStop(event){
      },
      /* This method gets triggered when the user starts to resize an internal event (already in the calendar) */
      handleEventResizeStart(event){
        this.removeCurrentEventViolation(event);
        this.internalEvent = event;
      },
      /* Check and remove the event from the violation list if it has been moved to a non violation slot */
      removeCurrentEventViolation:function(event){
        var ta_email = event.data.ta_email;
        var start = event.start.format();
        var end = event.end.format();
        var str = ta_email + "" + start + "" + end;
        var spliceIndex = -1;
        for(var i=0;i<this.violationList.length;i++){
          if(this.violationList[i].uniqueId === str){
            spliceIndex = i;
            break;
          }
        }
        this.violatedData = null;
        if(spliceIndex !== -1){
          var splicedData = this.violationList.splice(spliceIndex,1);
          this.violatedData = splicedData[0];
        }
      },
      /* This method is triggered when the user drops a TA (from outside the calendar) onto the calenar */
      handleExternalDrop(event){
        this.validateEvent(event);
        this.currentTADragged = "";
      },
      /* This method is called to check if it overlaps with any other existing constraints or events */
      validateEvent(event){
        var ta_email = event.data.ta_email;
        var ta_name = event.data.ta_name;
        var ta_type = event.data.ta_type;
        var self = this;
        var start = new Date(event.start);
        var end = new Date(event.end);
        var overlap = $('#calendar').fullCalendar('clientEvents', function(ev) {
            if( ev._id === event._id) {
                return false;
            }
            if( ev.rendering === 'background' && ev.courseSlot === true) {
                return false;
            }
            var estart = new Date(ev.start);
            var eend = new Date(ev.end);
            return (
                ( Math.round(start) >= Math.round(estart) && Math.round(start) < Math.round(eend) )
                ||
                ( Math.round(end) > Math.round(estart) && Math.round(end) <= Math.round(eend) )
                ||
                ( Math.round(start) <= Math.round(estart) && Math.round(end) >= Math.round(eend) )
            );
        });
        var overlapList = [];
        if(ta_type === 'UTA'){
          overlap.forEach(function(resultSet){
          if(resultSet.type === 'hard' || resultSet.type === 'soft'){
            overlapList.push(resultSet);
          }
          else {
            if(resultSet.data.ta_email === ta_email){
              resultSet["reason"] = "Same TA cannot be scheduled at the same time";
              overlapList.push(resultSet);
            }
            else if(resultSet.data.ta_type === 'UTA' && ta_type === 'UTA'){
              resultSet["reason"] = "No two UTAs can be scheduled at the same time";
              overlapList.push(resultSet);
            }
          }
        });
        }else{
          overlap.forEach(function(resultSet){
          if(resultSet.type === 'hard' || resultSet.type === 'soft'){
            overlapList.push(resultSet);
          }else{
            if(resultSet.data.ta_email === ta_email){
              resultSet["reason"] = "Same TA cannot be scheduled at the same time";
              overlapList.push(resultSet);
            }else{

            }
          }
        });
        }
        if (overlapList.length){
            var data = overlap[0];
            self.errorObj["start"] = event.start;
            self.errorObj["end"] = event.end;
            self.errorObj["details"] = event.data;
            if(data.taOverlap){
              self.errorObj["reason"] = "Two UTA's cannot be scheduled at the same time";
            }else{
              self.errorObj["reason"] = data.reason;
            }

            self.errorObj["type"] = data.type;
            self.errorObj["eventId"] = event._id;
            self.showErrorModal = true;
        }else{
          console.log("No overlap");
        }
      },
      /* This method is called when the user clicks on the override button in the violation dialogue box */
      override(details){
        var ta_email = details.details.ta_email;
        var start = details.start.format();
        var end = details.end.format();
        var str = ta_email + "" + start + "" + end;
        details["uniqueId"] = str;
        this.violationList.push(JSON.parse(JSON.stringify(details)));
        this.showErrorModal = false;
      },
      /* This method is called when the user clicks on the cancel button in the violation dialogue box */
      cancelOverride(details){
        var eventId = details.eventId;
        $('#calendar').fullCalendar('removeEvents', eventId);
        if(this.internalEvent !== null){
          var arr = [];
          arr.push(this.internalEvent);
          $('#calendar').fullCalendar('addEventSource', arr);
          this.internalEvent = null;
          if(this.violatedData !== undefined && this.violatedData !== null){
            this.violationList.push(JSON.parse(JSON.stringify(this.violatedData)));
          }
        }
        this.showErrorModal = false;
      },
      /* This method is triggered when the user moves an internal event from one slot to another */
      handleInternalDrop(event){
        this.addConstraints(this.taAvailability[event.data.ta_email]);
        this.removeCurrentEventViolation(this.internalEvent);
        this.validateEvent(event);
        this.removeConstrainst();
      },
      /* This method is triggered when the user resizes an internal event */
      handleResize(event){
        this.addConstraints(this.taAvailability[event.data.ta_email]);
        this.validateEvent(event);
        this.removeConstrainst();
      },
      /* This method is triggered when all the events are rendered in the calendar */
      eventAfterAllRender(event, element){
        this.fixRecurringEventCollision();
      },
      /* This method is triggered when the user clicks on an existing event in the calendar */
      eventClick: function(event, jsEvent, view){
        this.displayObj["day"] = event.start.format('dddd');
        this.displayObj["start"] = event.start.format('LT');
        this.displayObj["end"] = event.end.format('LT');
        this.displayObj["details"] = event.data;
        this.displayObj['eventRef'] = event;
        this.eventComment = event.data['comment'];
        this.selectedEvent = event;
        this.showModal = true;
      },
      /* This method is triggered when the user clicks on delete button in the class schedule popup */
      deleteEvent:function(event){
        var self = this;
        if (confirm('Delete "' + event.title + '"?'))
          {
              self.removeCurrentEventViolation(event);
              $('#calendar').fullCalendar('removeEvents', event._id);
              self.refreshEvents();
              self.showModal = false;
          }
      },
      /* This method is triggered when the user clicks on save button in the class schedule popup */
      saveEvent(event){
        event.eventRef.data['comment'] = this.eventComment;
        this.refreshEvents();
        this.showModal = false;
      },
      refreshEvents() { //client events to get all events in the current window
        this.eventsData = $('#calendar').fullCalendar('clientEvents', function(ev) {
            if( ev.rendering === 'background') {
                return false;
            }else{
              return true;
            }
        });
      },
      /* This method is called to save the schedule */
      saveSchedule(saveAndExport){
        var self = this;
        var schedule = [];
        this.refreshEvents();
        this.eventsData.forEach(function(details){
          var scheduleObj = {};
          if(details.type == null || details.type == undefined){
            scheduleObj["details"] = details.data;
            scheduleObj["start"] = details.start.format();
            scheduleObj["end"] = details.end.format();
            schedule.push(scheduleObj);
          }
        });
        var violations = this.violationList;
        if(violations === null || violations === undefined){
          violations = [];
        }
        axios.post(this.$store.state.url+'course/schedule/'+this.courseId,{"schedule":schedule, "violations":violations}).then(function(response){
          if(saveAndExport){
            self.downloadSchedule();
          }else{
            self.displayNotification("Schedule Updated Successfully", true);
          }
          
        }).catch(function(error){
          console.log("error"+error);
        });
      },
      /* This method is called to the export and download the schedule as .xls */
      downloadSchedule(){
        axios.get(this.$store.state.url+'course/schedule/download/'+this.courseId,{
          responseType:'blob'
        }).then(function(response){
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Schedule.xlsx'); //or any other extension
          document.body.appendChild(link);
          link.click();
        }).catch(function(error){
          console.log("error"+error);
        });
      },
      /* This method is called to set the TAs on the left pane draggable. This is done by using jquery ui draggable plugin. 
         This is the only method that uses jquery script in the application. */
      setDraggable: function(){
        var self = this;
        this.taDetails.forEach(function(data){
          var name = data.ta_name.replace(/\s+/g, '');
          var key = data.ta_email.split('@')[0].replace(/[^\w\s]/gi, '');
          var text = '';
          var tooltipText = data.ta_name + ' - ' + data.ta_type;
          if(data.availability === null){
            text = '<div class="column is-half"><a id="'+key+'" class="button wrapText is-fullwidth" style="border:1px solid #FF0000; height:100%">'+tooltipText+'</a></div>';
          }else{
            text = '<div class="column is-half"><a id="'+key+'" data-badge="'+data.availability.max_hours+'" class="button badge wrapText is-fullwidth" style="border:1px solid #32CD32; height:100%">'+tooltipText+'</a></div>';
          }
          $('#ta').append(text);
          $('#'+key).data('details',data);
        });

        $('#ta .button').each(function() {
          var details = $(this).data('details');
            $(this).data('event', {
              title: details.ta_name, // use the element's text as the event title
              stick: true, // maintain when user navigates (see docs on the renderEvent method)
              data:details,
              duration:'01:00'
            });
            $(this).draggable({
              zIndex: 999,
              revert: true,      // will cause the event to go back to its
              revertDuration: 0,
              start: function( event, ui ) {
                self.showConstraintsLegend = true;
                self.currentTADragged = ui.helper.data('event').data.ta_email;
                self.addConstraints(self.taAvailability[ui.helper.data('event').data.ta_email]);
              },
              stop:function(event, ui){
                self.showConstraintsLegend = false;
                self.removeConstrainst();
              }
            });
         });
      },
      /* clears all the events in the calendar */
      clearData:function(){
        this.events=[];
      },
      closeModal:function(){
        this.showModal = false;
        this.showErrorModal = false;
      },
      addConstraints: function(availability){
        if(availability != null){
          var self = this;
          var dummy = [];
          self.dummyEvents = [];
              if(availability.hard != null){
                var hardAvailable = availability.hard;
                hardAvailable.forEach(function(details){
                  var obj = JSON.parse(JSON.stringify(details));
                  obj["rendering"] = 'background';
                  obj["color"] =  '#ff9f89';
                  obj["type"] =  'hard';
                  dummy.push(obj);
                });
              }
              if(availability.soft != null){
                var softAvailable = availability.soft;
                softAvailable.forEach(function(details){
                  var obj = JSON.parse(JSON.stringify(details));
                  obj["rendering"] = 'background';
                  obj["type"] =  'soft';
                  obj["color"] =  '#FFFF00';
                  dummy.push(obj);
                });
              }
              self.dummyEvents.push(...JSON.parse(JSON.stringify(dummy)));
              $('#calendar').fullCalendar('addEventSource', self.dummyEvents);
          }
      },
      removeConstrainst: function(){
        var self = this;
        $('#calendar').fullCalendar('removeEventSource', self.dummyEvents);
      },
      isObjOnObj:function(a,b){
        var rect1 = a.getBoundingClientRect();
        var rect2 = b.getBoundingClientRect();

        return !(rect1.right <= rect2.left || 
                rect1.left >= rect2.right || 
                rect1.bottom <= rect2.top || 
                rect1.top >= rect2.bottom);
      },
      checkCollisionWithNext: function($elements, collisionsSoFar, current) {
        if (current+1 < $elements.length) {
            if (this.isObjOnObj($elements[current], $elements[current+1])) {
                collisionsSoFar = this.checkCollisionWithNext($elements, (collisionsSoFar+1), current+1);
            } else {
                if (collisionsSoFar > 0) {
                    collisionsSoFar += 1;
                }
            }
        } else 
        if (current+1 == $elements.length) {
            collisionsSoFar += 1;
        }
        
        return collisionsSoFar;
      },
      /* Method to find overlapping course slots - split and display it */
      fixRecurringEventCollision : function() {
        var self = this;
        let timeLine = $('#calendar').fullCalendar('getView').name.indexOf('timeline') !== -1;
        jQuery('.fc-bgevent-container').each(function(){
            var $elements = jQuery(this).find('.fc-bgevent');
            for (let i=0; i<$elements.length; i++) {
                let collissions = self.checkCollisionWithNext($elements, 0, i);
                for (let j=0; j<collissions; j++) {

                    if (timeLine) { 
                        $elements[i+j].style.height = (100/collissions) + '%';
                        $elements[i+j].style.top = (100/collissions)*(j) + '%';
                    } else {
                        $elements[i+j].style.width = (100/collissions) + '%';
                        $elements[i+j].style.left = (100/collissions)*(j) + '%';
                    }
                }
                
                i += collissions;
            }
        });
      },
      getDay:function(date){
        return moment(date).format('dddd');
      },
      getTime:function(time){
        return moment(time).format('LT');
      },
      isCourseSlotAvailable:function(){
        var isAvailable = false;
        var keys = Object.keys(this.courseRules);
        for(var i=0;i<keys.length;i++){
          if(this.courseRules[keys[i]].length > 0){
            isAvailable = true;
            break;
          }
        }
        return isAvailable;
      },
    },
    mounted(){
      var courseId = this.$route.params.id;
      this.courseId = courseId;
      var self = this;

      axios.get(this.$store.state.url+'course/schedule/'+courseId).then(function(response){
        if(!response.error){
          var events = response.data.result.schedule;
          if(events === null){
            events = [];
          }
          var dummy = [];
          events.forEach(function(data){
            var scheduleObj = {};
            scheduleObj["details"] = data.details;
            scheduleObj["start"] = data.start;
            scheduleObj["end"] = data.end;
            scheduleObj["title"]= data.details.ta_name;
            scheduleObj["data"]= data.details;
            dummy.push(scheduleObj);
          });
          var taList = response.data.result.ta_details;
          taList.forEach(function(data){
            var taEmail = data.ta_email;
            var taAva = data.availability;
            self.taAvailability[taEmail] = taAva;
          });
          self.taDetails = JSON.parse(JSON.stringify(taList));
          //Course rules
          var rules = response.data.result.course_rules;
          rules.forEach(function(rule, index){
            var eventObj = {};
            eventObj["start"] = rule.start;
            eventObj["end"] = rule.end;
            eventObj["rendering"] = "background";
            eventObj["courseSlot"] = true; 
            eventObj["backgroundColor"] = "rgb(6, 188, 243)";
            eventObj["key"] = index;
            eventObj["sec_id"] = rule.sec_id;
            dummy.push(eventObj);
            var start = rule.start;
            var end = rule.end;
            var key = moment(start).format('dddd');
            var obj = {};
            obj["start"] = moment(start).format('LT');
            obj["end"] = moment(end).format('LT');
            obj["color"] = rule.color;
            obj["sec_id"] = rule.sec_id;
            obj["key"] = index;
            self.courseRules[key].push(obj);
          });
          self.events = JSON.parse(JSON.stringify(dummy));
          for(var k in self.courseRules){
            (self.courseRules[k]).sort((obj1,obj2)=>{
              return (moment(obj2.start).isAfter(moment(obj1.start)))?1:-1;
            });
          }
          //Violations
          self.violationList = response.data.result.violations === null?[]:response.data.result.violations;
          self.setDraggable();
        }

      }).catch(function(error){
        console.log("error : "+error);
      });
      

      // get course details
      axios.get(this.$store.state.url+'course/'+courseId).then(function(res){
        var details = res.data.result;
        self.courseData = details.courseDetails;
        self.instructorData = details.instructorDetails;
      }).catch(function(error){
        console.log("error : "+error);
      });

    
    }

  }

</script>

<style>
.hide{
  display: none;
}
.show{
  display: block;
}
.wrapText {
    white-space: normal;
    word-wrap: break-word;
}
.is-error{
    color: #A50303 !important;
}
.slotEvent{
  background: none !important;
}
</style>
