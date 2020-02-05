<template>
  <header>
    <button class="button danger" @click.prevent="close">
      X
    </button>
  </header>
</template>

<script>
const remote = require('electron').remote;
export default {
  methods: {
    close() {
      remote.getCurrentWindow().close();
    }
  }
}
</script>