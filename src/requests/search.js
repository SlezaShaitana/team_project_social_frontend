import axios from 'axios';

function serializeQueryParams(params) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export default {
  // Поиск пользователей по запросу
  users(query) {
    if (typeof query === 'object' && query !== null && !Array.isArray(query)) {
      const serializedParams = serializeQueryParams(query);
      return axios.get(`account/search?${serializedParams}&isDeleted=false`);
    }
    if (typeof query === 'string') {
      return axios.get(`account/search?${query}&isDeleted=false`);
    }
    if (Array.isArray(query)) {
      const serializedParams = query.map(serializeQueryParams).join('&');
      return axios.get(`friends?statusCode=FRIEND&${serializedParams}`);
    }
    throw new TypeError('Недопустимое значение запроса');
  },


  recomendationFrends(query) {
    if (Array.isArray(query)) return axios.get(`account/search?${query.join('&')}&isDeleted=false&showFriends=false`)
  },
  // Поиск постов по запросу
  posts(query) {
    if (Array.isArray(query))
      return axios.get(`post?${query.join('&')}&sort=time,desc&isDeleted=false`);
    if (typeof query === 'string') return axios.get(`post?${query}`);

    throw new TypeError('Недопустимое значение запроса');
  },
};
