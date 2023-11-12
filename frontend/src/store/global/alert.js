export default {
  namespaced: true,
  state: {
    status: 'Успешно',
    text: 'Сделано!',
    show: false,
    timeout: 500,
  },
  getters: {
    getState: (state) => state,
  },
  mutations: {
    setInfo(state, value) {
      state.status = value.status;
      state.text = value.text;
    },
    toggleShow: (state) => (state.show = !state.show),
  },
  actions: {
    setAlert({ commit, state }, value) {
      commit('setInfo', value);
      commit('toggleShow');
      setTimeout(() => {
        commit('toggleShow');
      }, state.timeout);
    },
  },
};

