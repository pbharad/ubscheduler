<template>
  <nav class="navbar is-black" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" @click="dashboard">
    <span class="icon">
        <v-icon name="home"></v-icon>
    </span>
    </a>
  </div>
    <div class="navbar-menu">
      <div class="navbar-start">
      <a class="navbar-item">
      <span class="is-white" style="font-weight:700;">
          {{msg}}
        </span>
      </a>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a class="button" @click="logout()">
              <span class="icon is-small">
                <v-icon name="power-off"></v-icon>
              </span>
              <span>Logout</span>
            </a>
          </div>
      </div>
      </div>
    </div>
</nav>

</template>

<script>
export default {
  name: 'TopBand',
  data () {
    return {
      msg: 'UB Scheduler'
    }
  },
  methods:{
    logout:function(){
      this.$session.destroy();
      this.$router.push('/');
    },
    dashboard: function(){
      this.$router.push('/courses');
    }
  }
}
</script>
