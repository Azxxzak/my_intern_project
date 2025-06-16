<template>
  <div class="auth">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <router-link to="/register">Register</router-link></p>
  </div>
</template>

<script>
import { auth } from '../firebase/config';

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async login() {
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
        this.$router.push('/dashboard');
      } catch (err) {
        alert(err.message);
      }
    }
  }
};
</script>

<style scoped>
.auth {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
}
</style>
