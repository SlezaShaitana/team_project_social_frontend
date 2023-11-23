import friends from '@/requests/friends';

export default {
  namespaced: true,
  actions: {
    async apiBlockedUser({ dispatch }, id) {
      const response = await friends.blockedUser(id);
      dispatch(
        'global/alert/setAlert',
        { status: 'success', text: 'Пользователь заблокирован' },
        { root: true }
      );
      dispatch('profile/friends/apiFriends', null, { root: true });
      dispatch('global/search/searchUsers', 'global/search/getLastSearchUsersRequest', {
        root: true,
      });
      console.log('TCL: apiBlockedUser -> response', response);
    },

    async apiUnblockUser({ dispatch }, id) {
      const response = await friends.unblockUser(id);
      dispatch(
        'global/alert/setAlert',
        { status: 'success', text: 'Пользователь разблокирован' },
        { root: true }
      );
      dispatch('profile/friends/apiFriends', null, { root: true });
      dispatch('global/search/searchUsers', 'global/search/getLastSearchUsersRequest', {
        root: true,
      });
      console.log('TCL: apiUnblockUser -> response', response);
    },
  },
};
