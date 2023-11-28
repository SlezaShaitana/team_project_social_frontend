import notifications from '@/requests/notifications';
import axios from 'axios';

export default {
  namespaced: true,
  state: {
    notifications: [],
    notificationsLength: 0,
    userInfo: {},
    size: 0,
  },
  getters: {
    getNotifications: (state) => state.notifications,
    getNotificationsLength: (state) => state.notificationsLength,
    getNotificationsTextType: () => (type) => {
      switch (type) {
        case 'POST':
          return 'опубликовал новую запись';
        case 'POST_COMMENT':
          return 'оставил комментарий';
        case 'COMMENT_COMMENT':
          return 'ответил на ваш комментарий';
        case 'FRIEND_REQUEST':
          return '';
        case 'FRIEND_BIRTHDAY':
          return '';
        case 'MESSAGE':
          return 'прислал сообщение';
        case 'FRIEND_APPROVE':
          return '';
        case 'FRIEND_BLOCKED':
          return '';
        case 'FRIEND_UNBLOCKED':
          return '';
        case 'FRIEND_SUBSCRIBE':
          return '';
        case 'USER_BIRTHDAY':
          return '';
        case 'LIKE':
          return '';
        case 'SEND_EMAIL_MESSAGE':
          return '';

      }
    },
  },
  mutations: {
    setNotifications: (state, value) => (state.notifications = value),
    setReadedNotifications: (state, value) => (state.notifications = value),
    setNotificationsLength: (state, value) => (state.notificationsLength = value),
    addNotification(state, notification) {
      state.notifications.unshift(notification);
    },

    addNotificationsLength(state, notification) {
      if (notification.notificationType) state.notificationsLength = state.notificationsLength + 1;
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },

    incrementOffset(state, count) {
      state.size += count;
    }
  },

  actions: {
    async fetchNotifications({
      commit
    }) {

      // Отправка запроса на сервер с использованием текущей длины списка уведомлений
      const response = await notifications.get();

      // Получение списка уведомлений
      const notificationsList = response.data.content;

      // Получение списка авторов
      const authorIds = notificationsList
        .filter(notification => notification.data.authorId)
        .map(notification => notification.data.authorId);

      // Обращение к API для получения информации об авторах
      const userInfoRequestPromises = Array.from(new Set(authorIds)).map(async (authorId) => {
        try {
          const {
            data
          } = await axios.get(`/account/${authorId}`);
          return data;
        } catch (error) {
          console.error(`Не нашёл аккаунт с id: ${authorId}:`, error);
          return {};
        }
      });

      // Ожидание завершения всех запросов
      const userInfoResponses = await Promise.all(userInfoRequestPromises);

      // Создание объекта для хранения информации об авторах
      const userInfo = userInfoResponses.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // Обновление объекта состояния Vuex
      commit('setUserInfo', userInfo);

      // Обработка уведомлений
      const mergedNotifications = notificationsList.map(async notification => {
        const {
          authorId
        } = notification.data;
        if (authorId) {
          const authorInfo = userInfo[authorId];
          return {
            ...notification,
            data: {
              ...notification.data,
              author: authorInfo || {}
            }
          };
        } else {
          return notification;
        }
      });

      // Ожидание завершения обработки уведомлений
      commit('setNotifications', await Promise.all(mergedNotifications));
    },

    async fetchNotificationsLength({
      commit
    }) {
      const response = await notifications.getLength();
      commit('setNotificationsLength', response.data.data.count);
    },

    async readedNotifications({
      commit,
      dispatch
    }) {
      const response = await notifications.readed();
      commit('setReadedNotifications', response)
      await dispatch('fetchNotifications');
    }
  },
};