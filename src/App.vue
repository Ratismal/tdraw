<template>
  <div id="app">
    <header-frame />
    <app-canvas />
    <toolbar />
  </div>
</template>

<script>
import AppCanvas from '@/components/Canvas.vue';
import Toolbar from '@/components/Toolbar.vue';
import HeaderFrame from '@/components/HeaderFrame.vue';
import '@/assets/scss/main.scss';

export default {
  name: 'App',
  components: {
    AppCanvas,
    Toolbar,
    HeaderFrame,
  }
}
</script>
