import { Tools, Sizes, Colors } from '@/assets/constants';

const state = {
  tool: Tools.BRUSH,
  size: Sizes.MEDIUM,
  color: Colors.RED,
  diagnostics: {
    operations: 0,
    time: 0
  }
}

const getters = {

}

const actions = {

}

const mutations = {
  updateTool(state, tool) {
    state.tool = tool;
  },
  updateSize(state, size) {
    state.size = size;
  },
  updateColor(state, color) {
    state.color = color;
  },
  setDiagnostics(state, { operations, time }) {
    state.diagnostics = {
      operations,
      time
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}