<template>
  <div id="app">
    <button @click="goToOwner">Go to Owner</button>
    <button @click="goToClient">Go to Client</button>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    goToOwner() {
      this.$router.push('/owner');
    },
    goToClient() {
      this.$router.push('/client');
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>