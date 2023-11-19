import axios from 'axios';

export default {
  // Поиск пользователей по запросу
  users(query, myFriends = false) {
    if (!myFriends) {
      if (Array.isArray(query)) return axios.get(`account/search?${query.join('&')}&isDeleted=false`);
      if (typeof query === 'string') return axios.get(`account/search?${query}`);
    } else {
      if (Array.isArray(query)) return axios.get(`friends?statusCode=FRIEND&${query.join('&')}`);
      if (typeof query === 'string') return axios.get(`friends?statusCode=FRIEND&${query}`);
    }

    throw new TypeError('Недопустимое значение запроса');
  },
  // Поиск постов по запросу
  posts(query) {
    if (Array.isArray(query))
      return axios.get(`post?${query.join('&')}&sort=time,desc&isDeleted=false`);
    if (typeof query === 'string') return axios.get(`post?${query}`);

    throw new TypeError('Недопустимое значение запроса');
  },
};
