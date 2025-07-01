import { defineStore } from 'pinia'
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuthStore } from './auth'
import { ref } from 'vue'

export const useCommentsStore = defineStore('comments', () => {
    // Add a ref to store the user's review
    const userReview = ref(null)

    // Add a ref to store all comments for a movie
    const allComments = ref([])

    // Only addComment is needed
    const addComment = async (movieId, comment, rating) => {
        const authStore = useAuthStore()
        if (!authStore.user) throw new Error('You must be logged in to comment')
        const commentData = {
            movieId,
            comment,
            rating,
            userId: authStore.user.uid,
            userEmail: authStore.user.email,
            createdAt: serverTimestamp()
        }
        await addDoc(collection(db, 'comments'), commentData)
        await fetchUserReview(movieId) // Refresh user's review
    }

    // Fetch the current user's review for a movie
    const fetchUserReview = async (movieId) => {
        const authStore = useAuthStore()
        if (!authStore.user) {
            userReview.value = null
            return
        }
        const q = query(
            collection(db, 'comments'),
            where('movieId', '==', movieId),
            where('userId', '==', authStore.user.uid),
            limit(1)
        )
        const snapshot = await getDocs(q)
        userReview.value = snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    }

    // Fetch all comments for a movie
    const fetchAllComments = async (movieId) => {
        const q = query(
            collection(db, 'comments'),
            where('movieId', '==', movieId),
            orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        allComments.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    return { addComment, fetchUserReview, userReview, fetchAllComments, allComments }
}) 