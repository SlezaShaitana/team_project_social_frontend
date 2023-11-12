<template>
  <div class="push" :class="{ open: isOpen }">
    <div class="push__overlay" @click.stop="closePush" />

    <div class="push__wrap" :class="{ open: isOpen }" ref="wrapRef">
      <div class="push__list" ref="listRef">
        <div v-if="visibleNotifications.length > 0">
          <div
            class="push__item"
            v-for="info in visibleNotifications"
            :key="info.data.id"
          >
            <div
              class="main-layout__user-pic"
              style="background-color: #8bc49e"
            >
              <div class="push__img" v-if="info?.data?.author?.photo">
                <img
                  :src="info?.data?.author?.photo"
                  :alt="info?.data?.author?.firstName"
                />
              </div>
              <div v-else>
                {{
                  info?.data?.author?.firstName[0] +
                  " " +
                  info?.data?.author?.lastName[0]
                }}
              </div>
            </div>
            <p class="push__content">
              <router-link
                class="push__content-name"
                :to="getRouteByNotification(info?.data?.authorId)"
              >
                <span class="push__content-preview">
                  {{
                    info?.data?.author?.firstName +
                    " " +
                    info?.data?.author?.lastName
                  }}
                </span>
                {{ getNotificationsTextType(info?.data?.notificationType) }}
                «{{ info?.data?.content }}»
              </router-link>
              <span class="push__time">{{ formatTime(info.data.sentTime) }}</span>
            </p>
          </div>
        </div>
        <div v-else>
          <div>
            <p class="no__notifications">{{ translationsLang.notNotification }}</p>
          </div>
        </div>
      </div>
      <button class="push__btn" @click.prevent="showMore" v-if="showButtonMore">
        {{ translationsLang.showmoreNotification }}
      </button>
      <button
        class="push__btn"
        @click.prevent="readedButton"
        v-if="showButtonReaded"
      >
        {{ translationsLang.readedNotification }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import useTranslations from "@/composables/useTranslations";
import moment from "moment";
import { getRouteByNotification } from "@/utils/notifications.utils.js";

export default {
  name: "MainLayoutPush",
  props: {
    isOpen: Boolean,
  },

  setup(props, { emit }) {
    const { getters, dispatch, commit } = useStore();
    const visibleNotifications = ref([]);
    const showCount = ref(3);
    const isClickedButton = ref(false);
    const listRef = ref(null);
    const wrapRef = ref(null);
    const { translationsLang } = useTranslations();

    const getNotifications = computed(
      () => getters["profile/notifications/getNotifications"]
    );
    const getNotificationsLength = computed(
      () => getters["profile/notifications/getNotificationsLength"]
    );
    const getNotificationsTextType = computed(
      () => getters["profile/notifications/getNotificationsTextType"]
    );

    const shouldUpdateVisibleNotifications = computed(
      () => getNotifications.value.length === 0
    );
    const showButtonMore = computed(() => {
      if (visibleNotifications.value.length !== getNotifications.value.length) {
        return true;
      } else if (getNotifications.value.length === 0) {
        return false;
      } else {
        return false;
      }
    });
    const showButtonReaded = computed(() => {
      if (getNotifications.value.length === 0) {
        return false;
      } else if (
        getNotifications.value.length === visibleNotifications.value.length
      ) {
        return true;
      } else {
        return false;
      }
    });

    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        dispatch("profile/notifications/fetchNotifications").then(() => {
          loadVisibleNotifications();
        });
        if (getNotifications.value.length === 0) {
          dispatch("profile/notifications/fetchNotifications");
        }
        listRef.value.scrollTop = 0;
      } else {
        dispatch("profile/notifications/fetchNotificationsLength");
        visibleNotifications.value = [];
      }
    });

    watch(
      () => shouldUpdateVisibleNotifications,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          visibleNotifications.value = [...getNotifications];
        }
      }
    );

    onMounted(() => {
      if (getNotificationsLength.value === 0) {
        dispatch("profile/notifications/fetchNotificationsLength");
      }
      if (
        window.innerHeight -
          wrapRef.value.getBoundingClientRect().top -
          wrapRef.value.offsetHeight <
        0
      ) {
        wrapRef.value.style.maxHeight = `${
          window.innerHeight - wrapRef.value.getBoundingClientRect().top
        }px`;
      }
      // window.onscroll = () => {
      //   this.closePush();
      // };
    });

    const closePush = () => {
      if (!props.isOpen) return;
      emit("update:close-push");
    };

    const readedButton = () => {
      return dispatch("profile/notifications/readedNotifications");
    };

    const loadVisibleNotifications = () => {
      visibleNotifications.value = getNotifications.value.slice(0, showCount.value);
    };

    const showMore = () => {
      const startIndex = visibleNotifications.value.length;
      const newVisibleNotifications = getNotifications.value.slice(
        startIndex,
        startIndex + showCount.value
      );
      visibleNotifications.value = [
        ...visibleNotifications,
        ...newVisibleNotifications,
      ];
    };

    const incrementOffset = () => {
      commit("profile/notifications/incrementOffset");
    };

    const formatTime = (time) => {
      return moment(time).fromNow();
    };

    return {
      visibleNotifications,
      isClickedButton,
      listRef,
      wrapRef,
      translationsLang,
      getNotifications,
      getNotificationsTextType,
      showButtonMore,
      showButtonReaded,
      closePush,
      readedButton,
      showMore,
      incrementOffset,
      getRouteByNotification,
      formatTime,
    };
  },
};
</script>

<style lang="stylus">
@import '@/assets/stylus/base/vars.styl'

.no__notifications
  color ui-cl-color-full-black
  padding 15px 0
  text-align center
  cursor default

.push
  .push__overlay
    display none

  &.open
    .push__overlay
      display block

.push__overlay
  position fixed
  top 0
  left 0
  right 0
  bottom 0
  z-index -1
  cursor default

.push__wrap
  position absolute
  background ui-cl-color-white-theme
  box-shadow box-shadow-main
  right 0px
  top 65px
  width 100%
  border-radius border-small
  max-width 470px
  max-height 675px
  min-width 400px
  z-index 100
  opacity 0
  visibility hidden
  transition all 0.2s
  overflow-y auto

  &.open
    opacity 1
    visibility visible

.push__list
  overflow-y auto
  padding 10px
  max-height 450px

.push__item
  display flex
  align-items center
  padding 15px 5px
  overflow hidden
  transition all .2s ease-in-out

  @media (any-hover: hover)
    &:hover
      background-color ui-cl-color-white-bright
      border-radius border-super-small
      &+&
        border-top 0

  &+&
    border-top 1px solid ui-cl-color-white-bright-second

.push__btn
  display flex
  width 100%
  background transparent
  align-items center
  justify-content center
  font-weight font-weight-bold
  font-size font-size-downdefault
  letter-spacing 0.01em
  color ui-cl-color-eucalypt
  border-top 1px solid ui-cl-color-white-bright-second
  height 55px
  transition all .2s ease-in-out
  @media (any-hover: hover)
    &:hover
      background-color ui-cl-color-white-bright


.main-layout__user-pic
  width 50px
  height 50px
  border-radius border-half
  overflow hidden
  margin-right 15px
  flex none
  background-color ui-cl-color-light-eucalypt

  div
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
    object-fit cover

  img
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
    object-fit cover

@media (max-width 992px)
  .push__wrap
    right 0
    left 120px
    width auto
</style>
