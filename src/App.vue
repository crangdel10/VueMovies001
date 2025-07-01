<template>
  <header>
    <router-link to="/">
      <h1><span>Vue</span>Movies</h1>
    </router-link>
    <nav class="main-nav">
      <router-link to="/">Home</router-link>
      <template v-if="!authStore.user">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
      <template v-else>
        <router-link to="/profile">Profile</router-link>
        <a href="#" @click.prevent="logout" class="logout-link">Logout</a>
      </template>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<script setup>
import { useAuthStore } from './store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Fira Sans', sans-serif;

  &::selection {
    background: transparentize(#42B883, 0.5);
  }
}

body {
  background-color: #35495E;
}

a {
  text-decoration: none;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: #2C3D4E;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.1);

  h1 {
    color: #FFF;
    font-size: 28px;

    span {
      color: #42B883;
    }
  }
}

.main-nav {
  display: flex;
  gap: 16px;
  align-items: center;

  a,
  .router-link-active {
    color: #fff;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  a:hover,
  .router-link-active {
    background: #42B883;
    color: #fff;
  }
}

.logout-link {
  background: #e53935;
  color: #fff;
  font-weight: 600;
  border-radius: 10px;
  padding: 10px 22px;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
  display: inline-block;
}

.logout-link:hover {
  background: #b71c1c;
  color: #fff;
}
</style>