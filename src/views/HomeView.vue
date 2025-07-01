<template>
  <div class="home">
    <div class="feature-card">
      <router-link to="/movie/tt0409591">
        <img
          :src="getHighResPoster('https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg')"
          alt="Naruto Poster" class="featured-img" />
        <div class="detail">
          <h3>Naruto</h3>
          <p>Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of
            becoming the Hokage, the village's leader and strongest ninja.</p>
        </div>
      </router-link>
    </div>

    <form @submit.prevent="SearchMovies()" class="search-box">
      <input type="text" placeholder="What are you looking for?" v-model="search" />
      <input type="submit" value="Search" />
    </form>

    <div v-if="movies.length" class="filter-bar">
      <label>Sort by:</label>
      <select v-model="selectedFilter" @change="applyFilter">
        <option value="popular">Most Popular</option>
        <option value="recent">Most Recent</option>
        <option value="year">Year</option>
        <option value="rating">Highest Rating</option>
      </select>
    </div>

    <div v-if="!movies.length" class="slider-section">
      <h2>Popular Movies</h2>
      <Carousel v-if="filteredPopularMovies.length" :itemsToShow="4" :wrapAround="true" class="movie-carousel"
        :mouseDrag="true">
        <Slide v-for="movie in filteredPopularMovies" :key="movie.imdbID">
          <router-link :to="'/movie/' + movie.imdbID" class="movie-link">
            <img :src="getHighResPoster(movie.Poster)" alt="Movie Poster" @error="handlePosterError"
              class="carousel-img" />
            <div class="carousel-title">{{ movie.Title }}</div>
          </router-link>
        </Slide>
        <template #addons>
          <Navigation />
          <Pagination class="carousel-pagination" />
        </template>
      </Carousel>
      <div v-else class="no-movies">No popular movies available.</div>
    </div>

    <div v-if="!movies.length" class="slider-section">
      <h2>Latest Movies</h2>
      <Carousel v-if="filteredLatestMovies.length" :itemsToShow="4" :wrapAround="true" class="movie-carousel"
        :mouseDrag="true">
        <Slide v-for="movie in filteredLatestMovies" :key="movie.imdbID">
          <router-link :to="'/movie/' + movie.imdbID" class="movie-link">
            <img :src="getHighResPoster(movie.Poster)" alt="Movie Poster" @error="handlePosterError"
              class="carousel-img" />
            <div class="carousel-title">{{ movie.Title }}</div>
          </router-link>
        </Slide>
        <template #addons>
          <Navigation />
          <Pagination class="carousel-pagination" />
        </template>
      </Carousel>
      <div v-else class="no-movies">No latest movies available.</div>
    </div>

    <div class="movies-list">
      <div class="movie" v-for="movie in paginatedMovies" :key="movie.imdbID">
        <router-link :to="'/movie/' + movie.imdbID" class="movie-link">
          <div class="product-image">
            <img :src="getHighResPoster(movie.Poster)" alt="Movie Poster" @error="handlePosterError" />
            <div class="type">{{ movie.Type }}</div>
          </div>
          <div class="detail">
            <p class="year">{{ movie.Year }}</p>
            <h3>{{ movie.Title }}</h3>
          </div>
        </router-link>
      </div>
    </div>

    <div v-if="movies.length" class="pagination-bar">
      <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">&laquo;</button>
      <button v-for="page in pagesToShow" :key="page" :class="{ active: page === currentPage }" @click="goToPage(page)">
        {{ page }}
      </button>
      <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">&raquo;</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import env from '@/env.js'
import 'vue3-carousel/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'

const MOVIES_PER_PAGE = 8;

export default {
  components: { Carousel, Slide, Pagination, Navigation },
  setup() {
    const search = ref("");
    const movies = ref([]);
    const popularMovies = ref([]);
    const latestMovies = ref([]);
    const filteredPopularMovies = computed(() => popularMovies.value.filter(m => m.imdbID && m.Poster && m.Title));
    const filteredLatestMovies = computed(() => latestMovies.value.filter(m => m.imdbID && m.Poster && m.Title));
    const selectedFilter = ref('popular');
    const ratingsCache = ref({});
    const currentPage = ref(1);

    const SearchMovies = () => {
      if (search.value != "") {
        fetch(`http://www.omdbapi.com/?apikey=${env.apikey}&s=${search.value}`)
          .then(response => response.json())
          .then(data => {
            movies.value = data.Search || [];
            search.value = "";
            selectedFilter.value = 'popular';
            currentPage.value = 1;
          });
      }
    }

    // Use higher-res poster if available
    const getHighResPoster = (url) => {
      if (!url || url === 'N/A') {
        return 'https://via.placeholder.com/500x750/2c3d4e/ffffff?text=No+Poster';
      }
      return url.replace('SX300', 'SX700');
    };

    // Fallback for broken images
    const handlePosterError = (event) => {
      event.target.src = 'https://via.placeholder.com/500x750/2c3d4e/ffffff?text=Poster+Not+Found';
    };

    // Fetch popular and latest movies from Firestore
    onMounted(async () => {
      // Helper to fetch OMDb data if missing
      async function enrichMovie(movie) {
        if (movie.imdbID && movie.Poster && movie.Title) return movie;
        let url = '';
        if (movie.imdbID) {
          url = `http://www.omdbapi.com/?apikey=${env.apikey}&i=${movie.imdbID}`;
        } else if (movie.Title) {
          url = `http://www.omdbapi.com/?apikey=${env.apikey}&t=${encodeURIComponent(movie.Title)}`;
        } else {
          return movie;
        }
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.imdbID) {
            return { ...movie, ...data };
          }
        } catch (e) {
          // ignore error
        }
        return movie;
      }
      // Popular: order by 'popularity' descending
      const popQuery = query(collection(db, 'movies'), orderBy('popularity', 'desc'), limit(12));
      const popSnap = await getDocs(popQuery);
      let popMovies = popSnap.docs.map(doc => doc.data());
      // Fallback if no movies in Firestore
      if (!popMovies.length) {
        popMovies = [
          { Title: 'Inception', imdbID: 'tt1375666' },
          { Title: 'The Dark Knight', imdbID: 'tt0468569' },
          { Title: 'Interstellar', imdbID: 'tt0816692' },
          { Title: 'Avengers: Endgame', imdbID: 'tt4154796' },
          { Title: 'Parasite', imdbID: 'tt6751668' },
          { Title: 'Joker', imdbID: 'tt7286456' },
          { Title: 'Spider-Man: No Way Home', imdbID: 'tt10872600' },
          { Title: 'The Matrix', imdbID: 'tt0133093' },
          { Title: 'Forrest Gump', imdbID: 'tt0109830' },
          { Title: 'Pulp Fiction', imdbID: 'tt0110912' }
        ];
      }
      popMovies = await Promise.all(popMovies.map(enrichMovie));
      popularMovies.value = popMovies;
      // Latest: order by 'releaseDate' descending
      const latestQuery = query(collection(db, 'movies'), orderBy('releaseDate', 'desc'), limit(12));
      const latestSnap = await getDocs(latestQuery);
      let latMovies = latestSnap.docs.map(doc => doc.data());
      if (!latMovies.length) {
        latMovies = [
          { Title: 'Dune', imdbID: 'tt1160419' },
          { Title: 'No Time to Die', imdbID: 'tt2382320' },
          { Title: 'Tenet', imdbID: 'tt6723592' },
          { Title: 'Soul', imdbID: 'tt2948372' },
          { Title: 'The French Dispatch', imdbID: 'tt8847712' },
          { Title: 'Shang-Chi and the Legend of the Ten Rings', imdbID: 'tt9376612' },
          { Title: 'Black Widow', imdbID: 'tt3480822' },
          { Title: 'Eternals', imdbID: 'tt9032400' },
          { Title: 'The Suicide Squad', imdbID: 'tt6334354' },
          { Title: 'Free Guy', imdbID: 'tt6264654' }
        ];
      }
      latMovies = await Promise.all(latMovies.map(enrichMovie));
      latestMovies.value = latMovies;
    });

    // Fetch ratings for movies (for 'Highest Rating' filter)
    const fetchRatings = async (moviesArr) => {
      const promises = moviesArr.map(async (movie) => {
        if (!ratingsCache.value[movie.imdbID]) {
          const res = await fetch(`http://www.omdbapi.com/?apikey=${env.apikey}&i=${movie.imdbID}`);
          const data = await res.json();
          ratingsCache.value[movie.imdbID] = data.imdbRating ? parseFloat(data.imdbRating) : 0;
        }
      });
      await Promise.all(promises);
    };

    // Filtering logic
    const filteredMovies = computed(() => {
      let arr = [...movies.value];
      if (selectedFilter.value === 'recent') {
        arr.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
      } else if (selectedFilter.value === 'year') {
        arr.sort((a, b) => a.Year.localeCompare(b.Year));
      } else if (selectedFilter.value === 'rating') {
        arr.sort((a, b) => {
          const ratingA = ratingsCache.value[a.imdbID] || 0;
          const ratingB = ratingsCache.value[b.imdbID] || 0;
          return ratingB - ratingA;
        });
      }
      // 'popular' is default (as returned by OMDb)
      return arr;
    });

    // Pagination logic
    const totalPages = computed(() => Math.ceil(filteredMovies.value.length / MOVIES_PER_PAGE) || 1);
    const paginatedMovies = computed(() => {
      const start = (currentPage.value - 1) * MOVIES_PER_PAGE;
      return filteredMovies.value.slice(start, start + MOVIES_PER_PAGE);
    });
    const pagesToShow = computed(() => {
      return Array.from({ length: totalPages.value }, (_, i) => i + 1);
    });
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    // When filter changes to 'rating', fetch ratings if not already fetched
    const applyFilter = async () => {
      if (selectedFilter.value === 'rating') {
        await fetchRatings(movies.value);
      }
      currentPage.value = 1;
    };

    return {
      search,
      movies,
      SearchMovies,
      getHighResPoster,
      handlePosterError,
      popularMovies,
      latestMovies,
      filteredPopularMovies,
      filteredLatestMovies,
      selectedFilter,
      filteredMovies,
      paginatedMovies,
      currentPage,
      totalPages,
      pagesToShow,
      goToPage,
      applyFilter
    }
  }
}
</script>

<style lang="scss">
@import 'vue3-carousel/dist/carousel.css';

.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #20273a 0%, #42b883 100%);
  padding-bottom: 40px;

  .feature-card {
    position: relative;
    margin: 40px auto 36px auto;
    max-width: 950px;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 10px 36px rgba(44, 61, 78, 0.22);
    background: linear-gradient(135deg, #2c3d4e 0%, #35495e 100%);

    .featured-img {
      display: block;
      width: 100%;
      height: 360px;
      object-fit: cover;
      filter: brightness(0.95) contrast(1.08);
    }

    .detail {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(0deg, rgba(44, 61, 78, 0.97) 70%, rgba(44, 61, 78, 0.2) 100%);
      padding: 36px 48px 28px 48px;

      h3 {
        color: #FFF;
        margin-bottom: 12px;
        font-size: 2.3rem;
        font-weight: 700;
        letter-spacing: 1px;
      }

      p {
        color: #e0e0e0;
        font-size: 1.18rem;
        font-weight: 400;
      }
    }
  }

  .search-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 22px 0 14px 0;

    input {
      display: block;
      appearance: none;
      border: none;
      outline: none;
      background: none;

      &[type="text"] {
        width: 100%;
        max-width: 420px;
        color: #FFF;
        background-color: #496583;
        font-size: 21px;
        padding: 14px 20px;
        border-radius: 12px;
        margin-bottom: 17px;
        transition: 0.4s;

        &::placeholder {
          color: #f3f3f3;
        }

        &:focus {
          box-shadow: 0px 3px 14px rgba(0, 0, 0, 0.20);
        }
      }

      &[type="submit"] {
        width: 100%;
        max-width: 210px;
        background: linear-gradient(90deg, #42B883 0%, #369f6e 100%);
        padding: 15px;
        border-radius: 12px;
        color: #FFF;
        font-size: 21px;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 1px;
        transition: 0.3s;
        box-shadow: 0 2px 8px rgba(44, 61, 78, 0.10);

        &:active {
          background: #3B8070;
        }

        &:hover {
          background: #369f6e;
        }
      }
    }
  }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    max-width: 950px;
    margin: 0 auto 28px auto;
    background: rgba(44, 61, 78, 0.8);
    padding: 14px 28px;
    border-radius: 14px;
    color: #fff;
    font-size: 1.15rem;

    select {
      margin-left: 10px;
      padding: 10px 18px;
      border-radius: 10px;
      border: none;
      font-size: 1.05rem;
      background: #42b883;
      color: #fff;
      outline: none;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(44, 61, 78, 0.10);
    }
  }

  .slider-section {
    max-width: 1200px;
    margin: 0 auto 38px auto;

    h2 {
      color: #fff;
      margin: 28px 0 18px 12px;
      font-size: 1.7rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .movie-carousel {
      background: none;
      position: relative;

      .carousel__slide {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: none;
      }

      .carousel-img {
        width: 200px;
        height: 300px;
        object-fit: cover;
        border-radius: 14px;
        box-shadow: 0 2px 10px rgba(44, 61, 78, 0.13);
        margin-bottom: 10px;
        background: #222;
      }

      .carousel-title {
        color: #fff;
        font-size: 1.08rem;
        text-align: center;
        margin-bottom: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      // Make navigation buttons always visible and styled
      .carousel__prev,
      .carousel__next {
        opacity: 1 !important;
        visibility: visible !important;
        background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        font-size: 2rem;
        box-shadow: 0 2px 8px rgba(44, 61, 78, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }

      .carousel__prev {
        left: -24px;
      }

      .carousel__next {
        right: -24px;
      }

      .carousel__prev:hover,
      .carousel__next:hover,
      .carousel__prev:focus,
      .carousel__next:focus {
        background: #369f6e;
        color: #fff;
        box-shadow: 0 4px 16px rgba(44, 61, 78, 0.22);
        outline: none;
      }

      // Move pagination dots further below
      .carousel-pagination {
        margin-top: 32px !important;
      }
    }
  }

  .movies-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 36px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 18px;

    .movie {
      background: rgba(255, 255, 255, 0.11);
      border-radius: 18px;
      box-shadow: 0 4px 28px rgba(44, 61, 78, 0.13);
      overflow: hidden;
      transition: transform 0.18s, box-shadow 0.18s;

      &:hover {
        transform: translateY(-10px) scale(1.04);
        box-shadow: 0 10px 36px rgba(44, 61, 78, 0.22);
      }

      .movie-link {
        display: flex;
        flex-direction: column;
        height: 100%;
        text-decoration: none;
      }

      .product-image {
        position: relative;
        width: 100%;
        height: 340px;
        background: #222;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 18px 18px 0 0;
          transition: filter 0.2s;
        }
      }

      .type {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #42b883;
        color: #fff;
        padding: 4px 14px;
        border-radius: 8px;
        font-size: 0.98rem;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(44, 61, 78, 0.10);
        text-transform: capitalize;
      }

      .detail {
        padding: 20px 16px 16px 16px;
        background: rgba(44, 61, 78, 0.89);
        border-radius: 0 0 18px 18px;

        h3 {
          color: #fff;
          font-size: 1.18rem;
          font-weight: 600;
          margin-bottom: 7px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .year {
          color: #b0c4d4;
          font-size: 1.01rem;
        }
      }
    }
  }

  .no-movies {
    color: #fff;
    text-align: center;
    margin: 24px 0;
    font-size: 1.2rem;
    opacity: 0.7;
  }

  .pagination-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin: 38px 0 0 0;

    button {
      background: #35495e;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 12px 22px;
      font-size: 1.15rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, transform 0.15s;

      &.active,
      &:hover:not(:disabled) {
        background: #42b883;
        color: #fff;
        transform: translateY(-2px) scale(1.09);
      }

      &:disabled {
        background: #888;
        color: #eee;
        cursor: not-allowed;
        transform: none;
      }
    }
  }
}
</style>