import axios from 'axios';

export default {
  register(user) {
    return axios.post('auth/register', user);
  },

  login(user) {
    return axios.post('auth/login', user);
  },

  refreshToken(refreshToken) {
    return axios.post('auth/refresh', { refreshToken });
  },

  logout() {
    return axios.post('auth/logout');
  },

  captcha() {
    return axios.get('/api/v1/auth/captcha');
  },

  recoveryPassword(data) {
    return axios.post('auth/password/recovery/', data);
  },

  setPassword(data, secret) {
    return axios.post(`auth/password/recovery/${secret}`, data);
  },

  changePassword(data) {
    return axios.put('auth/password', data);
  },

  changeEmail(data) {
    return axios.put('auth/email', data);
  },

  requestChangeEmailLink(email) {
    return axios.post('auth/change-email-link', { email });
  },

  requestChangePasswordLink(data) {
    return axios.post('auth/change-password-link', data);
  },
};
