<template>
  <div class="auth">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <router-link to="/login">Login</router-link></p>
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
    async register() {
      try {
        await auth.createUserWithEmailAndPassword(this.email, this.password);
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
