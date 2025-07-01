<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>
      <p class="desc">Sign up to start exploring VueMovies.</p>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="displayName">Full Name</label>
          <input v-model="displayName" id="displayName" type="text" required placeholder="Enter your full name" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="email" id="email" type="email" required placeholder="Enter your email" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input v-model="password" id="password" type="password" required placeholder="Create a password" minlength="6" />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input v-model="confirmPassword" id="confirmPassword" type="password" required placeholder="Confirm your password" />
        </div>
        <button class="auth-btn" type="submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
      <p class="switch-link">Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const register = async () => {
  error.value = ''
  loading.value = true
  
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    loading.value = false
    return
  }
  
  // Validate password length
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.'
    loading.value = false
    return
  }
  
  try {
    const additionalData = {
      displayName: displayName.value,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    }
    
    await authStore.register(email.value, password.value, additionalData)
    router.push('/')
  } catch (err) {
    console.error('Registration error:', err)
    // Handle specific Firebase auth errors
    switch (err.code) {
      case 'auth/email-already-in-use':
        error.value = 'An account with this email already exists.'
        break
      case 'auth/invalid-email':
        error.value = 'Please enter a valid email address.'
        break
      case 'auth/weak-password':
        error.value = 'Password is too weak. Please choose a stronger password.'
        break
      case 'auth/operation-not-allowed':
        error.value = 'Email/password accounts are not enabled. Please contact support.'
        break
      default:
        error.value = 'Registration failed. Please try again.'
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