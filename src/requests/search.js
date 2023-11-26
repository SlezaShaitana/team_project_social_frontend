import axios from 'axios';

export default {
  // Поиск пользователей по запросу
  users(query) {
    if (Array.isArray(query)) return axios.get(`account/search?${query.join('&')}&isDeleted=false`);
    if (typeof query === 'string') return axios.get(`account/search?${query}`);
    if (Array.isArray(query)) return axios.get(`friends?statusCode=FRIEND&${query.join('&')}`);
    if (typeof query === 'string') return axios.get(`friends?statusCode=FRIEND&${query}`);

    throw new TypeError('Недопустимое значение запроса');
  },

  recomendationFrends(query) {
    if (Array.isArray(query)) return axios.get(`http://localhost:8099/api/v1/account/search?${query.join('&')}&isDeleted=false&showFriends=false`)
  },
  // Поиск постов по запросу
  posts(query) {
    if (Array.isArray(query))
      return axios.get(`post?${query.join('&')}&sort=time,desc&isDeleted=false`);
    if (typeof query === 'string') return axios.get(`post?${query}`);

    throw new TypeError('Недопустимое значение запроса');
  },
};