<template>
  <div class="login-wrapper">
    <div class="login-box">
      <h2 class="login-title">Welcome! 👋</h2>
      <p class="login-subtitle">
        Please sign-in to your account and start the adventure
      </p>

      <form @submit.prevent="login" class="login-form">
        <input type="email" v-model="email" placeholder="Email" required />

        <div class="password-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Password"
            required
          />
          <span class="toggle-password" @click="showPassword = !showPassword">
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 0 24 24"
              width="20"
              fill="#999"
            >
              <path
                d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 13c-3.03 0-5.5-2.47-5.5-5.5S8.97 6.5 12 6.5s5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5zm0-9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 0 24 24"
              width="20"
              fill="#999"
            >
              <path
                d="M12 6.5c-1.25 0-2.45.41-3.42 1.13l1.45 1.45a3.5 3.5 0 014.64 4.64l1.45 1.45C17.59 14.45 18 13.25 18 12a6 6 0 00-6-5.5zm-9.19-.12L4.9 7.47C3.29 8.79 2 10.79 2 12c1.73 3.89 6 7.5 10 7.5 1.63 0 3.16-.4 4.5-1.1l2.29 2.29 1.41-1.41L4.22 4.97 2.81 6.38zM7 12a5 5 0 015-5c1.25 0 2.45.41 3.42 1.13l1.45 1.45A3.5 3.5 0 0012 16.5a3.5 3.5 0 01-5-4.5z"
              />
            </svg>
          </span>
        </div>

        <div class="options">
          <label>
            Remember me
            <input type="checkbox" v-model="rememberMe" />
          </label>
          <router-link to="/forgot-password" class="forgot-link"
            >Forgot Password?</router-link
          >
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <p class="signup-link">
        New on our platform?
        <router-link to="/register">Create an account</router-link>
      </p>

      <div class="divider">or</div>

      <div class="socials">
        <a @click.prevent="loginWithProvider('facebook')"
          ><img src="../assets/icons8-facebook.svg" alt=""
        /></a>
        <a @click.prevent="loginWithProvider('twitter')"
          ><img src="../assets/icons8-x.svg" alt=""
        /></a>
        <a @click.prevent="loginWithProvider('github')"
          ><img src="../assets/icons8-github.svg" alt=""
        /></a>
        <a @click.prevent="loginWithProvider('google')"
          ><img src="../assets/icons8-google.svg" alt=""
        /></a>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from "../firebase";
import firebase from "firebase/compat/app";
import "firebase/auth";

export default {
  name: "UserLogin",
  data() {
    return {
      email: "",
      password: "",
      rememberMe: false,
      showPassword: false,
      loading: false,
    };
  },
  methods: {
    async login() {
      this.loading = true;
      try {
        await auth.signInWithEmailAndPassword(this.email, this.password);
        this.$router.push("/tasks");
      } catch (err) {
        alert("Login failed: " + err.message);
      } finally {
        this.loading = false;
      }
    },
    async loginWithProvider(providerName) {
      let provider = null;
      switch (providerName) {
        case "facebook":
          provider = new firebase.auth.FacebookAuthProvider();
          break;
        case "google":
          provider = new firebase.auth.GoogleAuthProvider();
          break;
        case "github":
          provider = new firebase.auth.GithubAuthProvider();
          break;
        default:
          alert("Unsupported provider");
          return;
      }

      try {
        const result = await auth.signInWithPopup(provider);
        console.log("Social login successful:", result.user);
        this.$router.push("/tasks");
      } catch (err) {
        alert("Social login failed: " + err.message);
      }
    },
  },
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9f9f9;
  padding: 1rem;
}

.login-box {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
  max-width: 380px;
  width: 100%;
}

.login-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #41b883;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #888;
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-form input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-75%);
  cursor: pointer;
  font-size: 1rem;
  user-select: none;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  color: #555;
}

.forgot-link {
  color: #41b883;
  text-decoration: none;
}

.login-form button {
  width: 100%;
  padding: 0.75rem;
  background-color: #41b883;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-form button:hover:not(:disabled) {
  background-color: #339d6e;
}

.signup-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
}

.signup-link a {
  color: #41b883;
  font-weight: bold;
  text-decoration: none;
}

.divider {
  margin: 1.25rem 0;
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
}

.socials {
  display: flex;
  justify-content: center;
  gap: 10%;
}

.socials a {
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.socials img:hover {
  width: 24px;
  height: 24px;
  transition: width 0.3s, height 0.3s;
}
.toggle-password:hover svg {
  fill: #555;
}
</style>
