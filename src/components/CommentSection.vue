<template>
  <div class="comment-section">
    <div class="section-header">
      <h3>Share Your Review</h3>
    </div>
    <div v-if="authStore.user">
      <div v-if="commentsStore.userReview">
        <div class="user-review-card">
          <div class="review-header">
            <span class="review-label">Your Review</span>
            <span class="review-date">{{ formatDate(commentsStore.userReview.createdAt) }}</span>
          </div>
          <div class="review-rating">
            <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= commentsStore.userReview.rating }">★</span>
            <span class="rating-value">{{ commentsStore.userReview.rating }}/5</span>
          </div>
          <div class="review-content">
            <p>{{ commentsStore.userReview.comment }}</p>
          </div>
        </div>
      </div>
      <div v-else class="comment-form-card">
        <div class="form-header">
          <h4>Rate & Comment</h4>
          <p>Help others discover great content</p>
        </div>
        <div class="rating-section">
          <label class="rating-label">Your Rating</label>
          <div class="rating-input-container">
            <div class="stars interactive">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="star" 
                :class="{ filled: i <= userRating, hover: i <= hoverRating }"
                @click="userRating = i"
                @mouseenter="hoverRating = i"
                @mouseleave="hoverRating = 0"
              >
                ★
              </span>
            </div>
            <span class="rating-value">{{ userRating }}/5</span>
          </div>
        </div>
        <div class="form-group">
          <label for="comment">Your Review</label>
          <textarea 
            id="comment" 
            v-model="newComment" 
            placeholder="Share your thoughts about this movie..."
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ newComment.length }}/500</div>
        </div>
        <button @click="submitComment" :disabled="!newComment.trim() || userRating === 0" class="submit-btn">
          <span class="btn-icon">📝</span>
          Submit Review
        </button>
      </div>
    </div>
    <div v-else class="login-prompt-card">
      <div class="prompt-content">
        <div class="prompt-icon">🔐</div>
        <h4>Join the Discussion</h4>
        <p>Sign in to share your thoughts and rate this movie</p>
        <router-link to="/login" class="login-btn">
          <span class="btn-icon">🚀</span>
          Sign In
        </router-link>
      </div>
    </div>

    <!-- All Comments Section -->
    <div v-if="commentsStore.allComments.length" class="all-comments-section">
      <h4>All Reviews</h4>
      <div v-for="comment in commentsStore.allComments" :key="comment.id" class="other-review-card">
        <div class="review-header">
          <span class="review-label">{{ comment.userEmail || 'User' }}</span>
          <span class="review-date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <div class="review-rating">
          <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= comment.rating }">★</span>
          <span class="rating-value">{{ comment.rating }}/5</span>
        </div>
        <div class="review-content">
          <p>{{ comment.comment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCommentsStore } from '../store/comments'
import { useAuthStore } from '../store/auth'
import { useRoute } from 'vue-router'

const commentsStore = useCommentsStore()
const authStore = useAuthStore()
const route = useRoute()

const newComment = ref('')
const userRating = ref(0)
const hoverRating = ref(0)

onMounted(() => {
  if (authStore.user) {
    commentsStore.fetchUserReview(route.params.id)
  }
  commentsStore.fetchAllComments(route.params.id)
})

// Refetch all comments when a new comment is added
watch(() => commentsStore.userReview, () => {
  commentsStore.fetchAllComments(route.params.id)
})

const submitComment = async () => {
  if (!newComment.value.trim() || userRating.value === 0) {
    alert('Please provide both a rating and a comment')
    return
  }
  try {
    await commentsStore.addComment(route.params.id, newComment.value, userRating.value)
    newComment.value = ''
    userRating.value = 0
    // The user's review will now be shown
  } catch (error) {
    alert(error.message || 'Error submitting review')
  }
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  if (timestamp.toDate) timestamp = timestamp.toDate()
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.comment-section {
  margin-top: 2rem;
  padding: 0;
}
.section-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}
.section-header h3 {
  color: #fff;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}
.comment-form-card {
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}
.user-review-card {
  background: rgba(66, 184, 131, 0.08);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(66, 184, 131, 0.2);
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.review-label {
  color: #42b883;
  font-weight: bold;
  font-size: 1.1rem;
}
.review-date {
  color: #888;
  font-size: 0.9rem;
}
.review-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.review-rating .star {
  color: #666;
  font-size: 1.3rem;
}
.review-rating .star.filled {
  color: #ffd700;
}
.rating-value {
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 40px;
}
.review-content p {
  color: #fff;
  font-size: 1rem;
  margin: 0;
}
.form-header {
  margin-bottom: 1.5rem;
}
.form-header h4 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}
.form-header p {
  color: #ccc;
  margin: 0;
  font-size: 0.9rem;
}
.rating-section {
  margin-bottom: 1.5rem;
}
.rating-label {
  display: block;
  color: #fff;
  margin-bottom: 0.75rem;
  font-weight: 500;
}
.rating-input-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stars.interactive {
  display: flex;
  gap: 8px;
}
.stars.interactive .star {
  color: #666;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
.stars.interactive .star:hover,
.stars.interactive .star.hover {
  color: #ffd700;
  transform: scale(1.1);
}
.stars.interactive .star.filled {
  color: #ffd700;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  color: #fff;
  margin-bottom: 0.75rem;
  font-weight: 500;
}
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.form-group textarea:focus {
  outline: none;
  border-color: #42b883;
  background: rgba(255,255,255,0.08);
}
.form-group textarea::placeholder {
  color: rgba(255,255,255,0.5);
}
.char-count {
  text-align: right;
  color: #ccc;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}
.submit-btn {
  background: linear-gradient(135deg, #42b883 0%, #369f6e 100%);
  color: #fff;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 184, 131, 0.4);
}
.submit-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-icon {
  font-size: 1.1rem;
}
.login-prompt-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.prompt-content {
  max-width: 300px;
  margin: 0 auto;
}
.prompt-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.prompt-content h4 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}
.prompt-content p {
  color: rgba(255,255,255,0.9);
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}
.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.2);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.login-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}
.all-comments-section {
  margin-top: 2.5rem;
}
.other-review-card {
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.2rem;
  border: 1px solid rgba(255,255,255,0.08);
}
</style> 