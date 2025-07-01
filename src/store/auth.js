import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../../firebase'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import userService from '../services/userService'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const userProfile = ref(null)
    const loading = ref(true)
    const initialized = ref(false)

    // Listen to Firebase Auth state
    onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out')
        user.value = firebaseUser
        if (firebaseUser) {
            try {
                // Get user profile from database
                const profile = await userService.getUserProfile(firebaseUser.uid)
                userProfile.value = profile
                console.log('User profile loaded:', profile ? 'Success' : 'No profile found')
            } catch (error) {
                console.error('Error loading user profile:', error)
                userProfile.value = null
            }
        } else {
            userProfile.value = null
        }
        loading.value = false
        initialized.value = true
    })

    const login = async (email, password) => {
        console.log('Attempting login for email:', email)
        try {
            loading.value = true
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            console.log('Login successful for user:', user.uid)

            // Update last login timestamp
            await userService.updateLastLogin(user.uid)

            return user
        } catch (error) {
            console.error('Login error:', error.code, error.message)
            throw error
        } finally {
            loading.value = false
        }
    }

    const register = async (email, password, additionalData = {}) => {
        console.log('Attempting registration for email:', email)
        try {
            loading.value = true
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            console.log('Registration successful for user:', user.uid)

            // Create user profile in database
            const userData = {
                email: user.email,
                displayName: additionalData.displayName || '',
                photoURL: additionalData.photoURL || '',
                preferences: additionalData.preferences || {},
                ...additionalData
            }

            await userService.createUserProfile(user.uid, userData)
            console.log('User profile created successfully')

            return user
        } catch (error) {
            console.error('Registration error:', error.code, error.message)
            throw error
        } finally {
            loading.value = false
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            userProfile.value = null
            console.log('Logout successful')
        } catch (error) {
            console.error('Error during logout:', error)
            throw error
        }
    }

    const updateProfile = async (updates) => {
        try {
            if (!user.value) throw new Error('No user logged in')

            await userService.updateUserProfile(user.value.uid, updates)
            console.log('Profile updated successfully')

            // Update local profile
            userProfile.value = { ...userProfile.value, ...updates }

            return true
        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        }
    }

    const updatePreferences = async (preferences) => {
        try {
            if (!user.value) throw new Error('No user logged in')

            await userService.updateUserPreferences(user.value.uid, preferences)
            console.log('Preferences updated successfully')

            // Update local profile
            if (userProfile.value) {
                userProfile.value.preferences = { ...userProfile.value.preferences, ...preferences }
            }

            return true
        } catch (error) {
            console.error('Error updating preferences:', error)
            throw error
        }
    }

    return {
        user,
        userProfile,
        loading,
        initialized,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences
    }
}) 