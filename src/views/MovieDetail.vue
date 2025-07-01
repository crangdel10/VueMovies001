<template>
  <div class="movie-detail">
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-else class="movie-card">
      <img :src="movie.Poster" alt="Movie Poster" class="featured-img" />
      <div class="info">
        <h2>{{ movie.Title }}</h2>
        <div class="meta">
          <span class="year">{{ movie.Year }}</span>
          <span v-if="movie.Runtime" class="runtime">• {{ movie.Runtime }}</span>
          <span v-if="movie.Genre" class="genre">• {{ movie.Genre }}</span>
        </div>
        <div v-if="movie.imdbRating && movie.imdbRating !== 'N/A'" class="rating-badge">
          <span class="star">★</span> IMDb {{ movie.imdbRating }}
        </div>
        <p class="plot">{{ movie.Plot }}</p>
      </div>
    </div>
    <CommentSection v-if="!error" :movieId="route.params.id" />
  </div>
</template>
<script>
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import CommentSection from '../components/CommentSection.vue';
import { OMDB_API_KEY } from '../services/env.js';

export default {
  components: { CommentSection },
  setup() {
    const movie = ref({});
    const route = useRoute();
    const error = ref("");

    onBeforeMount(() => {
      fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${route.params.id}&plot=full`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.Response === 'False') {
            error.value = data.Error || 'Movie not found.';
            movie.value = {};
          } else {
            movie.value = data;
            error.value = "";
          }
        })
        .catch(() => {
          error.value = 'Failed to fetch movie details.';
          movie.value = {};
        });
    });

    return {
      movie,
      route,
      error
    };
  }
}
</script>




<style lang="scss">
.movie-detail {
  max-width: 900px;
  margin: 32px auto 0 auto;
  padding: 0 16px 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.movie-card {
  display: flex;
  flex-direction: row;
  background: linear-gradient(135deg, #2c3d4e 0%, #35495e 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(44, 61, 78, 0.18);
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  margin-bottom: 32px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: center;
  }
}

.featured-img {
  width: 320px;
  height: 480px;
  object-fit: cover;
  border-radius: 18px 0 0 18px;
  background: #222;
  box-shadow: 0 2px 12px rgba(44, 61, 78, 0.12);

  @media (max-width: 700px) {
    width: 100%;
    height: 320px;
    border-radius: 18px 18px 0 0;
  }
}

.info {
  flex: 1;
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 700px) {
    padding: 24px 16px 16px 16px;
  }

  h2 {
    color: #fff;
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 1px;
  }

  .meta {
    color: #b0c4d4;
    font-size: 1.1rem;
    margin-bottom: 18px;

    .year,
    .runtime,
    .genre {
      margin-right: 10px;
    }
  }

  .rating-badge {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(90deg, #FFD700 0%, #FFB300 100%);
    color: #222;
    font-weight: bold;
    font-size: 1.15rem;
    border-radius: 8px;
    padding: 8px 18px;
    margin-bottom: 18px;
    box-shadow: 0 2px 8px rgba(44, 61, 78, 0.10);

    .star {
      color: #ff9800;
      font-size: 1.3rem;
      margin-right: 8px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18));
    }
  }

  .plot {
    color: #e0e0e0;
    font-size: 1.15rem;
    line-height: 1.6;
    margin-bottom: 0;
    margin-top: 8px;
  }
}

.movie-detail .error-message {
  color: #fff;
  background: #e74c3c;
  padding: 18px 24px;
  border-radius: 10px;
  margin: 32px auto;
  text-align: center;
  font-size: 1.2rem;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(44, 61, 78, 0.18);
}
</style>