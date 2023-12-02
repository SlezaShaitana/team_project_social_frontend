import axios from 'axios';

export default {
  newDialogs(id) {
    return axios.get(`/dialogs/recipientId/${id}`);
  },

  getMessages(id) {
    return axios.get(`dialogs/messages?recipientId=${id}&page=0&sort=time,asc`);
  },
  
  getOldMessages(id, countPage) {
    return axios.get(`dialogs/messages?recipientId=${id}&page=${countPage}&sort=time,desc`);
  },

  getDialogs() {
    return axios.get('/dialogs?page=0&sort=unreadCount,desc');
  },

  unreadedMessages() {
    return axios.get('/dialogs/unread');
  },

  markReaded(id) {
    return axios.put(`dialogs/${id}`);
  },
};
