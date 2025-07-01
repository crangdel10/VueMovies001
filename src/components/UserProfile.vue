<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>User Profile</h2>

      <div v-if="loading" class="loading">
        <p>Loading profile...</p>
      </div>

      <div v-else-if="userProfile" class="profile-content">
        <div class="profile-section">
          <h3>Personal Information</h3>
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="displayName">Full Name</label>
              <input v-model="editForm.displayName" id="displayName" type="text" placeholder="Enter your full name" />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input :value="userProfile.email" id="email" type="email" disabled class="disabled-input" />
              <small>Email cannot be changed</small>
            </div>

            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <div class="profile-section">
          <h3>Preferences</h3>
          <div class="preferences">
            <div class="preference-item">
              <label>
                <input v-model="editForm.preferences.notifications" type="checkbox" />
                Email Notifications
              </label>
            </div>

            <div class="preference-item">
              <label for="theme">Theme</label>
              <select v-model="editForm.preferences.theme" id="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div class="preference-item">
              <label for="language">Language</label>
              <select v-model="editForm.preferences.language" id="language">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <button @click="updatePreferences" class="save-btn" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Preferences' }}
            </button>
          </div>
        </div>

        <div class="profile-section">
          <h3>Account Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Member Since:</span>
              <span class="value">{{ formatDate(userProfile.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Last Login:</span>
              <span class="value">{{ formatDate(userProfile.lastLoginAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Account Status:</span>
              <span class="value status-active">Active</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Danger Zone</h3>
          <button @click="logout" class="logout-btn">
            Sign Out
          </button>
        </div>
      </div>

      <div v-else class="no-profile">
        <p>No profile information available.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)

const userProfile = computed(() => authStore.userProfile)

const editForm = ref({
  displayName: '',
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en'
  }
})

onMounted(() => {
  if (userProfile.value) {
    editForm.value.displayName = userProfile.value.displayName || ''
    editForm.value.preferences = {
      ...editForm.value.preferences,
      ...userProfile.value.preferences
    }
  }
})

const updateProfile = async () => {
  saving.value = true
  try {
    await authStore.updateProfile({
      displayName: editForm.value.displayName
    })
    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    saving.value = false
  }
}

const updatePreferences = async () => {
  saving.value = true
  try {
    await authStore.updatePreferences(editForm.value.preferences)
    alert('Preferences updated successfully!')
  } catch (error) {
    console.error('Error updating preferences:', error)
    alert('Failed to update preferences. Please try again.')
  } finally {
    saving.value = false
  }
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-card h2 {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  margin: 0;
  padding: 1.5rem 2rem;
  font-size: 1.5rem;
}

.profile-content {
  padding: 2rem;
}

.profile-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.profile-section h3 {
  color: #2c3d4e;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3d4e;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.disabled-input {
  background-color: #f5f5f5;
  color: #666;
}

.form-group small {
  color: #666;
  font-size: 0.875rem;
}

.save-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.save-btn:hover:not(:disabled) {
  background: #369f6e;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.preferences {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preference-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.preference-item select {
  width: 200px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-item .label {
  font-weight: 500;
  color: #2c3d4e;
}

.info-item .value {
  color: #666;
}

.status-active {
  color: #42b883 !important;
  font-weight: 500;
}

.logout-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  font-size: 1.15rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.logout-btn:hover {
  background: #b71c1c;
  color: #fff;
  transform: translateY(-2px) scale(1.09);
}

.loading,
.no-profile {
  padding: 2rem;
  text-align: center;
  color: #666;
}

@media (max-width: 768px) {
  .profile-container {
    margin: 1rem auto;
  }

  .profile-content {
    padding: 1rem;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>