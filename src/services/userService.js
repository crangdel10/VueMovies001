import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase'

class UserService {
    // Create or update user profile in Firestore
    async createUserProfile(userId, userData) {
        try {
            const userRef = doc(db, 'users', userId)
            await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: serverTimestamp()
            })
            return true
        } catch (error) {
            console.error('Error creating user profile:', error)
            throw new Error('Failed to create user profile')
        }
    }

    // Get user profile by ID
    async getUserProfile(userId) {
        try {
            const userRef = doc(db, 'users', userId)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                return userSnap.data()
            }
            return null
        } catch (error) {
            console.error('Error getting user profile:', error)
            throw new Error('Failed to get user profile')
        }
    }

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, {
                ...updates,
                updatedAt: serverTimestamp()
            })
            return true
        } catch (error) {
            console.error('Error updating user profile:', error)
            throw new Error('Failed to update user profile')
        }
    }

    // Update last login timestamp
    async updateLastLogin(userId) {
        try {
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, {
                lastLoginAt: serverTimestamp()
            })
            return true
        } catch (error) {
            console.error('Error updating last login:', error)
            throw new Error('Failed to update last login')
        }
    }

    // Check if user exists by email
    async getUserByEmail(email) {
        try {
            const usersRef = collection(db, 'users')
            const q = query(usersRef, where('email', '==', email))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0]
                return {
                    id: userDoc.id,
                    ...userDoc.data()
                }
            }
            return null
        } catch (error) {
            console.error('Error getting user by email:', error)
            throw new Error('Failed to get user by email')
        }
    }

    // Get user preferences
    async getUserPreferences(userId) {
        try {
            const userRef = doc(db, 'users', userId)
            const userSnap = await getDoc(userRef)

            if (userSnap.exists()) {
                const userData = userSnap.data()
                return userData.preferences || {}
            }
            return {}
        } catch (error) {
            console.error('Error getting user preferences:', error)
            throw new Error('Failed to get user preferences')
        }
    }

    // Update user preferences
    async updateUserPreferences(userId, preferences) {
        try {
            const userRef = doc(db, 'users', userId)
            await updateDoc(userRef, {
                preferences: preferences,
                updatedAt: serverTimestamp()
            })
            return true
        } catch (error) {
            console.error('Error updating user preferences:', error)
            throw new Error('Failed to update user preferences')
        }
    }
}

export default new UserService() 