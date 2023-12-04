<template>
  <div class="comments" :class="{ 'comments--admin': admin }">
    <div class="comments__add" v-if="!admin">
      <comment-add
        ref="addCommentRef"
        :id="id"
        v-model="commentText"
        @submited="onSubmitComment"
      />
    </div>

    <div class="comments__list" v-if="getInfo && info">
      <comment-block
        v-for="i in info.value"
        :admin="admin"
        :key="i.id"
        :info="i"
        :edit="getInfo.id === i.authorId"
        :deleted="getInfo.id === i.authorId"
        @edit-comment="onEditMain"
      />
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import CommentBlock from "@/components/Comments/Block.vue";
import CommentAdd from "@/components/Comments/Add.vue";

export default {
  name: "CommentsIndex",
  components: { CommentAdd, CommentBlock },
  props: {
    admin: Boolean,
    info: Object,
    id: String,
    edit: Boolean,
    deleted: Boolean,
  },

  setup(props) {
    const store = useStore();
    const info = ref(props.info);
    const commentText = ref("");
    const commentEdit = ref(false);
    const commentEditInfo = ref(null);
    const isOpenComments = ref("");
    const addCommentRef = ref(null);
    const likeAmout = ref(null);

    const getInfo = computed(() => store.getters["profile/info/getInfo"]);
    const showText = computed(() =>
      isOpenComments.value ? "скрыть" : "показать"
    );

    watch(likeAmout, () => {
      return props.info.totalElements;
    });

    const onEditMain = ({ commentInfo, commentVal }) => {
      commentEdit.value = true;
      commentText.value = commentVal;
      commentEditInfo.value = commentInfo;
      addCommentRef.value.$refs.addInput.focus();
    };

    const onSubmitComment = () => {
      store.dispatch(
        "profile/comments/commentActions",
        {
          edit: commentEdit.value,
          postId: props.id,
          text: commentText.value,
          id: commentEdit.value ? commentEditInfo.value.id : null,
        }).then(() => {
          commentText.value = "";
          commentEdit.value = false;
          commentEditInfo.value = null;
        });
    };

    const setComputed = () => {
      info.value.subComments = info.value.subСomments
        ? info.value.subComments
        : [];
    };

    const showMore = async () => {
      await store.dispatch("profile/comments/commentsById", {
        postId: props.info.id,
        currentPage: props.info.comments.page,
      });
      // $forceUpdate();
    };

    return {
      commentText,
      addCommentRef,
      getInfo,
      showText,
      onEditMain,
      onSubmitComment,
      setComputed,
      showMore,
    };
  },
};
</script>

<style lang="stylus">
@import '@/assets/stylus/base/vars.styl'

.comments-no
  margin-bottom 0

.comments
  &.open
    .comment-block, .comment-block__reviews
      display block

  &.comments--admin
    padding-bottom 40px

    .comment-block
      &:first-child
        display none

      .edit
        display none

.comments__title
  display flex
  align-items center
  margin-bottom 30px

  span
    font-weight font-weight-bold
    font-size font-size-default
    color ui-cl-color-medium-grey-light
    display block

.comments__show
  font-size font-size-small
  color ui-cl-color-eucalypt

.comments__list
  width 100%
</style>
