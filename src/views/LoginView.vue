<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Sign In</h2>
      <p class="desc">Access your account to explore VueMovies.</p>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="email" id="email" type="email" required placeholder="Enter your email" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="password" id="password" type="password" required placeholder="Enter your password" />
        </div>
        <button class="auth-btn" type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="switch-link">Don't have an account? <router-link to="/register">Register</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const login = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    // Handle specific Firebase auth errors
    switch (err.code) {
      case 'auth/user-not-found':
        error.value = 'No account found with this email address.'
        break
      case 'auth/wrong-password':
        error.value = 'Incorrect password. Please try again.'
        break
      case 'auth/invalid-email':
        error.value = 'Please enter a valid email address.'
        break
      case 'auth/too-many-requests':
        error.value = 'Too many failed attempts. Please try again later.'
        break
      case 'auth/user-disabled':
        error.value = 'This account has been disabled.'
        break
      default:
        error.value = 'Login failed. Please check your credentials and try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #35495e 0%, #42b883 100%);
}
.auth-card {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(44, 61, 78, 0.15);
  width: 100%;
  max-width: 370px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.auth-card h2 {
  margin-bottom: 0.5rem;
  color: #2c3d4e;
  text-align: center;
}
.desc {
  color: #888;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
}
label {
  margin-bottom: 0.3rem;
  color: #2c3d4e;
  font-weight: 500;
}
input {
  padding: 0.7rem 1rem;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
input:focus {
  border-color: #42b883;
}
.auth-btn {
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 0;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 0.7rem;
  transition: background 0.2s;
}
.auth-btn:hover {
  background: #369f6e;
}
.error {
  color: #e74c3c;
  text-align: center;
  margin-bottom: 0.5rem;
}
.switch-link {
  text-align: center;
  margin-top: 0.5rem;
  color: #2c3d4e;
}
.switch-link a {
  color: #42b883;
  text-decoration: underline;
}
</style> 