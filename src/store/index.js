import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

import canvas from './modules/canvas';
import save from './modules/save';

Vue.use(Vuex);

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: ['save', 'canvas']
})

export default new Vuex.Store({
  modules: {
    canvas, save
  },
  plugins: [vuexLocal.plugin]
})