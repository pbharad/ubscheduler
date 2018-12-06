// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router';
import {routes} from './router'
import bulma from 'bulma/css/bulma.css'
import animation from 'animate.css/animate.min.css'
import accordion from 'bulma-extensions/bulma-accordion/dist/css/bulma-accordion.min.css'
import checkbox from 'bulma-extensions/bulma-checkradio/dist/css/bulma-checkradio.min.css'
import badge from 'bulma-extensions/bulma-badge/dist/css/bulma-badge.min.css'
import 'jquery-ui-dist/jquery-ui';
import multisel from 'vue-multiselect/dist/vue-multiselect.min.css';
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate';
import VueSession from 'vue-session'
import FullCalendar from "vue-full-calendar";
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import "fullcalendar/dist/fullcalendar.min.css";
import Multiselect from 'vue-multiselect'
import environmentVar from '../../environment';
window.$ = require('jquery');
window.jQuery = require('jquery');

Vue.use(FullCalendar);
Vue.config.productionTip = false;
Vue.config.productionTip = false
Vue.use(bulma);
Vue.use(Vuex);
Vue.use(accordion);
Vue.use(checkbox);
Vue.use(VueRouter);
Vue.use(multisel);
Vue.component('multiselect', Multiselect);
Vue.use(animation);
Vue.use(badge);
/*
  session to maintain login session
  persist - to persist the session across tabs
*/

Vue.use(VueSession, {persist:true});
Vue.component('v-icon', Icon)

/* Routes */

const router = new VueRouter({routes});

/* Before handler to check for authentication for each route */

router.beforeEach((to, from, next) => {
  var session = router.app.$session;
  if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log("Auth required");
    if(session.has('id')){
      console.log("Auth success - directing");
      next();
    }else{
      console.log("Auth failed - Redirecting to home");
      next('/');
    }
  }else{
    console.log("No auth");
    next();
  }
});

/* Store to maintain global variables to be accessed for all the components */

const store = new Vuex.Store({
  state: {
    isLoggedIn: true,
    //url:'http://schedulingframeworkapi.us-east-2.elasticbeanstalk.com/',
    url:environmentVar.APP_SERVER_URL+'api/',
    notification:{
      showNotification:false,
      notificationMsg : "",
      success:true
    }
    
  },
  mutations: {
  },
  plugins: [createPersistedState()],
})

/* Vue instance */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
})
