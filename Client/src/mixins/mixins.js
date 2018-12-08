export const globalMixin =  {
    methods:{
        displayNotification : function(msg, type){
          var self = this;
          this.$store.state.notification.notificationMsg = msg;
          this.$store.state.notification.success = type;
          this.$store.state.notification.showNotification = true;
          setTimeout(function(){
            self.$store.state.notification.showNotification = false;
            self.$store.state.notification.notificationMsg = "";
            self.$store.state.notification.success = true;
          }, 5000);
      },
    }
}