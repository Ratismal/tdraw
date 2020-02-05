const state = {
  pages: [],
  currentPage: 0
}

const getters = {
  currentPage(state) {
    return state.pages[state.currentPage] || [];
  }
}

const actions = {

}

const mutations = {
  savePageState(state, data) {
    state.pages[state.currentPage] = JSON.parse(JSON.stringify(data));
  },
  setPage(state, page) {
    state.currentPage = page;
    if (!state.pages[page]) state.pages[page] = [];
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}