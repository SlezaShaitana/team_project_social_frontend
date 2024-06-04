import axios from 'axios';

function serializeQueryParams(params) {
  return Object.keys(params)
    .map(key => ${encodeURIComponent(key)}=${encodeURIComponent(params[key])})
    .join('&');
}

export default {
  // Поиск пользователей по запросу
  users(query) {
    let baseURL = '';
    let serializedParams = '';

    if (typeof query === 'object' && query !== null && !Array.isArray(query)) {
      serializedParams = serializeQueryParams(query);
      baseURL = query.path === 'friends' ? 'friends?statusCode=FRIEND' : 'account/search';
    } else if (Array.isArray(query)) {
      serializedParams = query.join('&');
      baseURL = 'account/search';
    } else if (typeof query === 'string') {
      serializedParams = query;
      baseURL = 'account/search';
    } else {
      throw new TypeError('Недопустимое значение запроса');
    }
    if (baseURL.includes('account/search')) {
      serializedParams += ${serializedParams ? '&' : ''}isDeleted=false;
    }

    return axios.get(${baseURL}?${serializedParams});
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
