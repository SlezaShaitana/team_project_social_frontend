import dialogsApi from '@/requests/dialogs';

export default {
  namespaced: true,
  state: {
    dialogs: [],
    unreadedMessages: 0, // total unreaded
    messages: [], // sorted oldest->newest 0 is oldest
    totalMessages: null,
    dialogsLoaded: false,
    activeDialogId: null,
    oldLastKnownMessageId: null,
    isHistoryEndReached: false,
    newMessage: {},
  },
  getters: {
    getDialogs: (state) => state.dialogs,
    getMessages: (state) => state.messages,
    oldestKnownMessageId: (state) => (state.messages),
    activeDialog: (state) => state.dialogs.find((el) => el.id == state.activeDialogId),
    getActiveDialogId: (state) => state.activeDialogId,
    dialogsLoaded: (state) => state.dialogsLoaded,
    unreadedMessages: (state) => state.unreadedMessages,
    hasOpenedDialog: (state) => (dialogId) => !!state.dialogs.find((el) => el.id == dialogId),
    isHistoryEndReached: (state) => state.isHistoryEndReached,
  },
  mutations: {
    clearMessages(state) {
      state.messages = [];
    },

    setUnreadedMessages: (state, unread) => (state.unreadedMessages = unread),
    setDialogs: (state, dialogs) => (state.dialogs = dialogs),
    setNewMessage: (state, newMessage) => (state.newMessage = newMessage),
    dialogsLoaded: (state) => (state.dialogsLoaded = true),
    setActiveDialogId: (state, value) => (state.activeDialogId = value),
    addMessages: (state, { messages, total }) => {
      state.messages = [...state.messages, ...messages];
      state.messages.sort((a, b) => a.time - b.time);
      state.totalMessages = total;
    },

    addOneMessage: (state, messagePayload) => {
      state.messages.push(messagePayload);
    },
    selectDialog: (state, dialogId) => {
      state.activeId = dialogId;
      state.messages = [];
      state.isHistoryEndReached = false;
    },
    markEndOfHistory: (state) => (state.isHistoryEndReached = true),
  },

  actions: {
    // Создание диалога. Если нет диалога - создаём, если есть - получаем;
    // Запрос: axios.get(`/dialogs/recipientId/${id}`);
    async newDialogs({ commit }, recipientId) {
      try {
        const response = await dialogsApi.newDialogs(recipientId);
        if (!response.data) return;
        const { data } = response.data || {}; // добавляем проверку на существование content
        commit('selectDialog', data);
      } catch (err) {
        console.log(err);
      }
    },

    // Получаем сообщения диалога по dialogId
    // Запрос: dialogs/messages?recipientId=${id}&page=0&size=1&sort=time,desc
    async fetchMessages({ commit }, dialogId) {
      const response = await dialogsApi.getMessages(dialogId);
      if (!response.lastMessage) return;
      const messages = [{
        ...response.lastMessage,
      }];
      commit('clearMessages');
      commit('addMessages', {
        messages,
        total: response.unreadCount,
      });
    },

    // Получаем все диалоги:
    // Запрос: /dialogs?page=0&sort=unreadCount,desc
    async fetchDialogs({ commit }) {
      try {
        const response = await dialogsApi.getDialogs();
        if (response.data?.content?.length === 0) return;

        const data = response.data.content;
        commit('setDialogs', data);
      } catch (err) {
        console.log(err);
      }
    },

    async apiUnreadedMessages({ commit, dispatch }) {
      const { data } = await dialogsApi.unreadedMessages();
      commit('setUnreadedMessages', data);
      await dispatch('fetchDialogs');
    },

    async markReadedMessages({ dispatch }, _, id) {
      await dialogsApi.markReaded(id);
      await dispatch('fetchDialogs');
    },
  },
};

