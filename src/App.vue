<script>
import HeatMap from './components/HeatMap.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    HeatMap,
    Footer,
  },
};
</script>

<template>
  <div
    class="content"
    role="main"
  >
    <h1
      class="project-title"
      id="title"
    >
      Monthly Global Land-Surface Temperature
    </h1>
    <HeatMap />
  </div>

  <footer>
    <Footer />
  </footer>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;

  &::before {
    box-sizing: border-box;
  }

  &::after {
    box-sizing: border-box;
  }
}

html {
  background-color: #fff; // explicitly set to override any system themes
}

#app {
  color: $text-gray;
  display: flex; // boilerplate to keep footer down below
  flex-direction: column; // footer at the bottom ;)
  font-family: "Open Sans", Helvetica, Arial, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh; // needed to stick the footer to bottom
  text-align: center;
}

.content {
  flex: 1 0 auto; // grow page space to content
}

.project-title {
  margin: 1rem 0 1rem 0;
}

footer {
  /* Prevent Chrome, Opera, and Safari from letting these items shrink to smaller than their
  content's default minimum size. */
  flex-shrink: 0;
}
</style>
