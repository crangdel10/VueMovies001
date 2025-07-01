<template>
  <div class="movie-detail">
    <h2>{{ movie.Title }}</h2>
    <div v-if="movie.imdbRating" class="rating-badge">
      IMDb Rating: <span>{{ movie.imdbRating }}</span>
    </div>
    <p>{{ movie.Year }}</p>
    <img :src="getHighResPoster(movie.Poster)" alt="Movie Poster" class="featured-img" @error="handlePosterError" />
    <p>{{ movie.Plot }}</p>
    <CommentSection :movieId="route.params.id" />
  </div>
</template>

<script>
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import CommentSection from '../components/CommentSection.vue';
import env from '@/env.js';

export default {
  components: {
    CommentSection
  },
  setup () {
    const movie = ref({});
    const route = useRoute();

    const getHighResPoster = (url) => {
      if (!url || url === 'N/A') {
        // Return a default poster image for missing posters
        return 'https://via.placeholder.com/500x500/2c3d4e/ffffff?text=No+Poster+Available';
      }
      // Convert to high resolution poster
      return url.replace('SX300', 'SX1000');
    };

    const handlePosterError = (event) => {
      // If poster fails to load, show default poster
      event.target.src = 'https://via.placeholder.com/500x500/2c3d4e/ffffff?text=Poster+Not+Found';
    };

    onBeforeMount(() => {
      fetch(`http://www.omdbapi.com/?apikey=${env.apikey}&i=${route.params.id}&plot=full`)
        .then(response => response.json())
        .then(data => {
          movie.value = data;
        });
    });

    return {
      movie,
      getHighResPoster,
      handlePosterError,
      route
    }
  }
}
</script>

<style lang="scss">
.movie-detail {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(44, 61, 78, 0.7);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(44, 61, 78, 0.12);

  h2 {
    color: #FFF;
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 8px;
    text-align: center;
  }

  .rating-badge {
    display: inline-block;
    background: #222;
    color: #FFD700;
    font-weight: bold;
    border-radius: 6px;
    padding: 6px 14px;
    margin-bottom: 16px;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(44, 61, 78, 0.12);
    span {
      color: #fff;
      margin-left: 6px;
      font-size: 20px;
    }
  }

  p {
    color: #FFF;
    font-size: 18px;
    line-height: 1.4;
    text-align: center;
    margin-bottom: 12px;
  }

  .featured-img {
    display: block;
    width: 100%;
    max-width: 500px;
    height: 500px;
    max-height: 60vw;
    object-fit: contain;
    background: #222;
    margin-bottom: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(44, 61, 78, 0.12);
  }
}

@media (max-width: 700px) {
  .movie-detail {
    padding: 12px 4px;
    h2 {
      font-size: 22px;
    }
    .featured-img {
      max-width: 90vw;
      height: 220px;
      max-height: 50vw;
      margin-bottom: 16px;
    }
    p {
      font-size: 16px;
    }
    .rating-badge {
      font-size: 15px;
      padding: 5px 10px;
      span {
        font-size: 16px;
      }
    }
  }
}
</style>