<template>
  <form
    action="#"
    class="comment-add"
    :class="{ 'is-subcomment': isSubcomment }"
    @submit.prevent=""
  >
    <div class="comment-add__pic" v-if="getInfo.photo">
      <img :src="getInfo.photo" :alt="getInfo.firstName" />
    </div>

    <div class="comment-add__pic" v-else>
      <unknow-user />
    </div>

    <div class="comment-add__input-container">
      <input
        type="text"
        minlength="5"
        class="comment-add__input"
        :placeholder="
          isSubcomment
            ? translationsLang.commentAddPlaceholderFirst
            : translationsLang.commentAddPlaceholderSecond
        "
        v-model="commentText"
        v-on:keydown.ctrl.enter="onSubmitComment"
      />
      <emoji-picker @emoji="onEmojiClicked" :search="search" source="apple">
        <template #invoker="{ events: { click: clickEvent } }">
          <button class="emoji-invoker" @click.stop="clickEvent">
            <emoji-icon />
          </button>
        </template>

        <template #picker="{ emojis, insert }">
          <div class="emoji-picker">
            <div class="emoji-picker__search">
              <input type="text" v-model="search" v-focus />
            </div>

            <div>
              <div v-for="(emojiGroup, category) in emojis" :key="category">
                <h5>{{ category }}</h5>
                <div class="emojis">
                  <span
                    v-for="(emoji, emojiName) in emojiGroup"
                    :key="emojiName"
                    @click="insert(emoji)"
                    :title="emojiName"
                  >
                    {{ emoji }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </emoji-picker>
    </div>
    <button
      class="comment-add__submit-btn"
      type="submit"
      useStore
      @click.prevent="onSubmitComment"
    >
      <submit-icon />
    </button>
  </form>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useTranslations from "@/composables/useTranslations";
import EmojiPicker from "vue3-emoji-picker";
import 'vue3-emoji-picker/css'
import EmojiIcon from "@/Icons/EmojiIcon.vue";
import SubmitIcon from "@/Icons/SubmitIcon.vue";
import UnknowUser from "@/Icons/UnknowUser.vue";

export default {
  name: "CommentAdd",

  components: {
    EmojiPicker,
    EmojiIcon,
    SubmitIcon,
    UnknowUser,
  },

  directives: {
    focus: {
      inserted(el) {
        el.focus();
      },
    },
  },

  props: {
    modelValue: String,
    id: [Number, String],
    parentId: Number,
    isSubcomment: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const store = useStore();
    const input = ref("");
    const search = ref("");

    const { translationsLang } = useTranslations();

    const getInfo = computed(() => store.getters["profile/info/getInfo"]);
    const commentText = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const onSubmitComment = () => {
      emit("update:submited");
    };

    const onEmojiClicked = (emoji) => {
      commentText.value += emoji;
    };

    return {
      input,
      search,
      translationsLang,
      getInfo,
      commentText,
      onSubmitComment,
      onEmojiClicked,
    };
  },
  expose: ["setFocus"],
};
</script>

<style lang="stylus">
@import '@/assets/stylus/base/vars.styl'
.emoji-invoker
  position absolute
  top 18%
  right 10px
  width 1.5rem
  height 1.5rem
  border-radius border-half
  cursor pointer
  transition all 0.2s
  padding 0
  background transparent
  border 0

.emoji-invoker:hover
  transform scale(1.1)

.emoji-picker
  position absolute
  bottom 100%
  left 100%
  z-index 1
  border 1px solid #ccc
  width 386px
  height 400px
  overflow-y scroll
  padding 20px
  box-sizing border-box
  border-radius 0.5rem
  background ui-cl-color-white-theme
  box-shadow 1px 1px 8px #c7dbe6

.emoji-picker__search
  display flex
  margin-bottom 15px

.emoji-invoker > svg
  fill #bdcdd6

.emoji-picker__search > input
  flex 1
  border-radius 10rem
  border 1px solid #ccc
  padding 0.5rem 1rem
  outline none

.emoji-picker h5
  margin-bottom 0
  color #b1b1b1
  text-transform uppercase
  font-size 0.8rem
  cursor default

.emoji-picker .emojis
  display flex
  flex-wrap wrap
  justify-content space-between

.emoji-picker .emojis:after
  content ""
  flex auto

.emoji-picker .emojis span
  padding 0.2rem
  cursor pointer
  border-radius border-super-small

.emoji-picker .emojis span:hover
  background #ececec
  cursor pointer

.comment-add__input-container
  position relative
  display flex
  width 100%
  margin-right 10px
  align-items center
  justify-content space-between

.open-comment
  border-color #575757

.comment-add
  display flex
  max-width 515px
  padding-top 20px
  align-items center
  margin-bottom 30px

  &.is-subcomment
    padding-top 10px !important
    margin-bottom 10px !important
    border-top 1px solid ui-cl-color-white-bright-second
    border-bottom none
    margin-top 20px

.comment-add__submit-btn
  background-color transparent
  color #bdcdd6

.comment-add__pic
  width 34px
  height 34px
  border-radius border-half
  overflow hidden
  margin-right 15px
  flex none
  background #9eaab0

  img
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
    object-fit cover

  div
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
    object-fit cover

.comment-add__input
  font-size font-size-small
  width 100%
  line-height 17px
  color #6A6A80
  padding 7px 90px 7px 13px
  height 40px
  max-height none
  border 1px solid #d3d9de
  border-radius 6px
  display block

  &::placeholder
    color #B0B0BC

.comment-add__icon
  cursor pointer

  &+&
    margin-left: 10px

  &.photo
    .simple-svg-wrapper
      width: 22px
      height: 22px

  &.add
    margin-top: -5px

    .simple-svg-wrapper
      width: 15px
      height: 15px
</style>
