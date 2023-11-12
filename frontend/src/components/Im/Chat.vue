<template>
  <div class="im-chat" v-if="filteredUserInfo && filteredUserInfo.length > 0">
    <div class="im-chat__user">
      <router-link
        class="im-chat__user-pic"
        :to="{
          name: 'ProfileId',
          params: { id: filteredUserInfo && filteredUserInfo[0]?.id },
        }"
      >
        <div class="main-layout__user-pic">
          <img
            v-if="filteredUserInfo && filteredUserInfo[0]?.photo"
            :src="filteredUserInfo && filteredUserInfo[0]?.photo"
            :alt="
              filteredUserInfo &&
              filteredUserInfo[0]?.firstName[0] + ' ' + filteredUserInfo &&
              filteredUserInfo[0]?.firstName[0]
            "
          />

          <div v-else>
            <unknow-user />
          </div>
        </div>
      </router-link>

      <router-link
        class="im-chat__user-name"
        :to="{
          name: 'ProfileId',
          params: { id: filteredUserInfo && filteredUserInfo[0]?.id },
        }"
      >
        {{ filteredUserInfo && filteredUserInfo[0]?.firstName }}
        {{ filteredUserInfo && filteredUserInfo[0]?.lastName }}
      </router-link>

      <div>
        <span
          class="user-status chat-isonline-lasttime"
          v-if="filteredUserInfo[0]?.lastOnlineTime === null"
        >
          {{ translationsLang.messageStatusLongAgo }}
        </span>
        <span
          class="user-status chat-isonline-isonline-online"
          v-else-if="filteredUserInfo[0]?.isOnline"
        >
          {{ translationsLang.profileInfoStatusOnline }}
        </span>
        <span class="user-status chat-isonline-isonline-lasttime" v-else>
          {{ translationsLang.messageStatusWasOnline }}
          {{ formatLastTime(filteredUserInfo[0]?.lastOnlineTime) }}
        </span>
      </div>
    </div>

    <div class="im-chat__infitite_list_wrapper chat-message">
      <virtual-list
        class="im-chat__infitite_list scroll-touch"
        :size="60"
        :keeps="120"
        :data-key="'id'"
        :data-sources="messageDialog"
        :data-component="itemComponent"
        :wrap-class="'im-chat__message'"
        :root-tag="'section'"
        @totop="onScrollToTop"
        @scroll.passive="onScroll"
        @tobottom="onScrollToBottom"
        ref="vslRef"
      >
        <div class="im-chat__loader" :v-slot="header" v-show="fetching">
          <div class="spinner" v-show="!isHistoryEndReached()" />
          <div class="finished" v-show="isHistoryEndReached()">
            {{ translationsLang.messageHistoryIsFinal }}
          </div>
        </div>
      </virtual-list>
    </div>

    <form class="im-chat__enter" action="#" @submit.prevent="onSubmitMessage">
      <input
        class="im-chat__enter-input"
        type="text"
        :placeholder="translationsLang.messageInputPlaceholder"
        v-model="mes"
      />
      <button
        v-if="mes.length > 0"
        class="im-chat__enter-submit"
        @click.prevent="onSubmitMessage"
      >
        <submit-icon />
      </button>
    </form>
  </div>
</template>

<script>
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  getCurrentInstance,
} from "vue";
import { useStore } from "vuex";
import useTranslations from "@/composables/useTranslations";
import UnknowUser from "@/Icons/UnknowUser.vue";
import axios from "axios";
import ChatMessage from "@/components/Im/ChatMessage.vue";
import VirtualList from "vue3-virtual-scroll-list";
import SubmitIcon from "@/Icons/SubmitIcon.vue";
import moment from "moment";

const makeHeader = (msgDate) => {
  return { id: `group-${msgDate}`, stubDate: true, date: msgDate };
};

export default {
  name: "ImChat",
  components: {
    UnknowUser,
    SubmitIcon,
    VirtualList,
  },

  props: {
    info: Object,
    messages: Array,
    online: Boolean,
    userInfo: Array,
  },

  setup(props) {
    const { getters, dispatch, commit } = useStore();
    const instance = getCurrentInstance();
    const $socket = instance.appContext.config.globalProperties.$socket;
    const messages = ref(props.messages);
    const follow = ref(false);
    const mes = ref("");
    const isUserViewHistory = ref(false);
    const itemComponent = ref(ChatMessage);
    const fetching = ref(false);
    const lastId = ref(-1);
    const infoChatUser = ref(null);
    const messageDialog = ref([]);
    const vslRef = ref(null);
    const { translationsLang } = useTranslations();

    const getInfo = computed(() => getters["profile/info/getInfo"]);

    const messagesGrouped = computed(() => {
      let groups = [];
      let headerDate = null;
      for (let i = 0; i < props.messages.length; i++) {
        const msg = props.messages[i];
        const msgDate = new Date(msg.time).toDateString();
        if (msgDate !== headerDate) {
          headerDate = msgDate;
          groups.push(makeHeader(headerDate));
        }
        msg.isSentByMe = msg.authorId === getInfo.value.id;
        msg.id = `message-${i}`; // добавляем уникальный ключ
        groups.push(msg);
      }
      return groups;
    });
    const getInfoConversationPartner = computed(() => {
      return props.info?.conversationPartner1 === getInfo.value?.id
        ? props.info?.conversationPartner2
        : props.info?.conversationPartner2 === getInfo.value?.id
        ? props.info?.conversationPartner1
        : null;
    });
    const filteredUserInfo = computed(() =>
      props.userInfo?.filter(
        (user) => user.id === getInfoConversationPartner.value
      )
    );

    watch(messages, () => {
      if (follow.value) setVirtualListToBottom();
    });

    watch(getInfoConversationPartner, async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        getMessageChat();
      }
    });

    onMounted(async () => {
      follow.value = true;
      await axios.put(`dialogs/${props.info.id}`);
      if (!getInfo.value) {
        await dispatch("profile/info/apiInfo");
        getInfoChat();
      }
    });

    const getInfoChat = () => {
      const conversationPartnerId =
        props.info.conversationPartner1 === getInfo.value.id
          ? props.info.conversationPartner2
          : props.info.conversationPartner2 === getInfo.value.id
          ? props.info.conversationPartner1
          : null;
      console.log(conversationPartnerId);
      const user = props.userInfo.find(
        (user) => user.id === conversationPartnerId
      );
      infoChatUser.value = user;
    };

    const onSubmitMessage = () => {
      if (!mes.value.trim()) return;
      const payload = {
        type: "MESSAGE",
        recipientId: props.info.conversationPartner2,
        data: {
          time: null,
          conversationPartner1: props.info.conversationPartner1,
          conversationPartner2: props.info.conversationPartner2,
          messageText: mes.value,
          readStatus: null,
          dialogId: props.info.id,
        },
      };
      commit("profile/dialogs/addOneMessage", payload.data);
      getMessageChat();
      $socket.sendMessage(payload);
      lastId.value -= 1;
      mes.value = "";
    };

    const onScrollToTop = async () => {
      if (vslRef.value) {
        if (!isHistoryEndReached()) {
          let [oldest] = messagesGrouped.value;

          this.fetching = true;
          await dispatch("profile/dialogs/loadOlderMessages");
          setVirtualListToOffset(1);

          nextTick(() => {
            let offset = 0;
            for (const groupedMsg of messagesGrouped.value) {
              if (groupedMsg.id === oldest.id) break;
              offset += vslRef.value.getSize(groupedMsg.id);
            }

            setVirtualListToOffset(offset);
            fetching.value = false;
          });
        }
      }
    };

    const getMessageChat = () => {
      axios
        .get(
          `dialogs/messages?recipientId=${getInfoConversationPartner.value}&page=0&sort=time,asc`
        )
        .then((response) => {
          messageDialog.value = response.data.content;
        })
        .catch((error) => {
          console.log(error);
        });
    };

    const onScroll = () => {
      follow.value = false;
    };

    const onScrollToBottom = () => {
      follow.value = true;
    };

    const setVirtualListToOffset = (offset) => {
      if (vslRef.value) {
        vslRef.value.scrollToOffset(offset);
      }
    };

    const setVirtualListToBottom = () => {
      if (vslRef.value) {
        vslRef.value.scrollToBottom();
      }
    };

    const isHistoryEndReached = () => {
      getters["profile/dialogs/isHistoryEndReached"];
    };

    const formatLastTime = (time) => {
      return moment(time).fromNow();
    };
    // const getDialogs = () => {
    //   getters['profile/dialogs/getDialogs']
    // };

    // const postMessage = () => {
    //   dispatch('profile/dialogs/postMessage');
    // };
    // const fetchMessages = () => {
    //   dispatch('profile/dialogs/fetchMessages');
    // };
    // const markReadedMessages = () => {
    //   dispatch('profile/dialogs/markReadedMessages');
    // };

    return {
      mes,
      isUserViewHistory,
      itemComponent,
      fetching,
      messageDialog,
      vslRef,
      translationsLang,
      filteredUserInfo,
      onSubmitMessage,
      onScrollToTop,
      onScroll,
      onScrollToBottom,
      setVirtualListToBottom,
      isHistoryEndReached,
      formatLastTime,
    };
  },
};
</script>

<style lang="stylus">
@import '@/assets/stylus/base/vars.styl'

.im-chat
  position relative
  display flex
  flex-direction column
  height 100%

.isonline-online
  color ui-cl-color-white-bright-second
  background-color ui-cl-color-eucalypt

.im-chat__user
  display flex
  align-items center
  height 40px
  padding 30px 20px
  font-size font-size-small
  background-color ui-cl-color-white-bright-second
  border-bottom 1px solid #d2d4d7

  .user-status
    padding 4px
    font-size font-size-super-upsmall
    line-height 100%

.im-chat__user-pic
  width 40px
  height 40px
  border-radius border-half
  overflow hidden
  margin-right 10px
  .main-layout__user-pic
    width 40px
    height 40px

.im-chat__user-name
  font-weight font-weight-bold
  font-size font-size-default
  color ui-cl-color-steel-gray
  margin-right auto

.im-chat__user-status
  color #9EA4AD

  &.online
    color ui-cl-color-eucalypt

.im-chat__infitite_list_wrapper
  padding 20px
  position relative
  overflow-y auto
  flex 1
  &.div:not(:last-child)
    margin-bottom 20px

.im-chat__infitite_list
  position absolute
  top 0
  bottom 0
  left 0
  right 0
  overflow-y auto

.im-chat__message > div
  padding 20px

.im-chat__enter
  position relative
  display block
  width 100%

.im-chat__enter-input
  width 100%
  background-color ui-cl-color-363636
  padding 0px 80px 0px 40px
  font-size font-size-default
  color ui-cl-color-white-theme
  height 80px

  &::placeholder
    color #B0B0BC

.im-chat__enter-submit
  position absolute
  top 20px
  right 20px
  background-color transparent
  color #bdcdd6
  :hover
    color ui-cl-color-white-theme

.im-chat__enter-submit > svg
  height 40px
  width 40px

.im-chat__loader
  padding 1em

  .finished
    font-size font-size-small
    text-align center
    color #bfbfbf

  .spinner
    font-size font-size-super-upsmall
    margin 0 auto
    text-indent -9999em
    width 25px
    height 25px
    border-radius border-half
    background ui-cl-color-white-theme
    background linear-gradient(to right, ui-cl-color-eucalypt 10%, rgba(255, 255, 255, 0) 42%)
    position relative
    animation load3 1.4s infinite linear
    transform translateZ(0)

  .spinner:before
    width 50%
    height 50%
    background ui-cl-color-eucalypt
    border-radius 100% 0 0 0
    position absolute
    top 0
    left 0
    content ''

  .spinner:after
    background #f8fafd
    width 75%
    height 75%
    border-radius border-half
    content ''
    margin auto
    position absolute
    top 0
    left 0
    bottom 0
    right 0

  @-webkit-keyframes load3
    0%
      transform rotate(0deg)
    100%
      transform rotate(360deg)

  @keyframes load3
    0%
      transform rotate(0deg)
    100%
      transform rotate(360deg)
</style>
