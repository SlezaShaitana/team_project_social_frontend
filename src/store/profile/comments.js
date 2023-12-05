import comments from '@/requests/comments';
import getAuthor from '@/utils/getAuthor';

export default {
  state: {
    comments: {},
    subComments: {},
  },
  namespaced: true,
  getters: {
    authors: (state, getters, rootState) => rootState.global.authors.authors,
    getComents: (state) => state.comments,
  },

  mutations: {
    addComments: (state, comments) => {
      state.comments = {
        ...state.comments,
        [comments.postId]: {
          ...comments,
          value: state.comments[comments.postId]
            ? [...state.comments[comments.postId].value, ...comments.value]
            : comments.value,
        },
      };
    },

    addSubComments: (state, subComments) => {
      state.subComments = {
        ...state.subComments,
        [subComments.commentId]: {
          ...subComments,
          value: state.subComments[subComments.commentId]
            ? [...state.subComments[subComments.commentId].value, ...subComments.value]
            : subComments.value,
        },
      };
    },

    deleteComment: (state, { postId, id }) => {
      state.comments = {
        ...state.comments,
        [postId]: {
          ...state.comments[postId],
          value: state.comments[postId].value.filter((comment) => comment.id !== id),
        },
      };
    },

    deleteSubComment: (state, { id, parentId }) => {
      state.subComments = {
        ...state.subComments,
        [parentId]: {
          ...state.subComments[parentId],
          value: state.subComments[parentId].value.filter((comment) => comment.id !== id),
        },
      };
    },

    prependComment: (state, comment) => {
      state.comments = {
        ...state.comments,
        value: [comment, ...state.comments.value],
      };
    },

    clearComments: (state) => {
      state.comments = {};
    },

    clearSubComments: (state) => {
      state.subComments = {};
    },
  },

  actions: {
    async commentsById(
      { commit, dispatch, getters },
      { postId, currentPage = null, commentId = null }
    ) {
      const response = await comments.get(postId, currentPage, commentId);

      const { content, totalPages, totalElements } = response.data;
      const page = response.data.number;

      const currentComments = await content.reduce(async (acc, comment) => {
        const accumulator = await acc;
        const author = await getAuthor(comment.authorId, getters.authors, dispatch);

        comment = {
          ...comment,
          author,
        };

        accumulator.push(comment);
        return accumulator;
      }, []);
      const data = {
        postId,
        value: currentComments,
        page,
        totalPages,
        totalElements,
        commentId,
      };

      if (commentId) commit('addSubComments', data);
      else commit('addComments', data);
    },

    async newComment({ dispatch, commit }, payload) {
      await comments.add(payload.postId, {
        parentId: payload.parentId,
        commentText: payload.text,
      });
      if (payload.parentId) commit('clearSubComments');
      else commit('clearComments');

      dispatch('commentsById', { postId: payload.postId, commentId: payload.parentId || null });
    },

    async editComment({ dispatch }, payload) {
      await comments.edit(payload.postId, {
        commentText: payload.text,
        id: payload.id
      });
      dispatch('commentsById', { postId: payload.postId });
    },

    async deleteComment({ commit }, payload) {
      await comments.delete(payload.postId, payload.id);
      if (payload.parentId) commit('deleteSubComment', payload);
      else commit('deleteComment', payload);
    },

    async recoverComment({ dispatch }, payload) {
      await comments.recover(payload.postId, payload.id);
      dispatch('commentsById', { postId: payload.postId });
    },

    async commentActions({ dispatch }, payload) {
      if (payload.edit) await dispatch('editComment', payload);
      else await dispatch('newComment', payload);
    },
  },
};
