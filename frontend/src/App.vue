<template>
  <div id="app">
    <component :is="layout" v-if="layout && !isDeleted">
      <router-view />
    </component>
    <div class="deleted-account" v-else-if="isDeleted">
      <delete-account :info="info" />
    </div>
  </div>
</template>

<script>
import { computed, watch, defineAsyncComponent } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import DeleteAccount from "./layouts/DeleteAccount.vue";

export default {
  name: "App",
  components: {
    FormLayout: defineAsyncComponent(() => import("@/layouts/FormLayout")),
    MainLayout: defineAsyncComponent(() => import("@/layouts/MainLayout")),
    EmptyLayout: defineAsyncComponent(() => import('@/layouts/EmptyLayout.vue')),
    DeleteAccount,
  },
  setup() {
    const store = useStore();
    const route = useRoute();

    const alert = computed(() => store.state.global.alert);
    const info = computed(() => store.state.profile.info);
    const layout = computed(() => route.meta.layout + "-layout");
    const isDeleted = computed(() => info.value && info.value.isDeleted);

    watch(alert, (newValue) => {
      if (!newValue.show) return;

        switch (newValue.status) {
          case 'success':
            this.$VueToastify.success(newValue.text);
            break;
          case 'response':
            this.$VueToastify.success(newValue.text, 'Ответ запроса');
            break;
          case 'action':
            this.$VueToastify.success(newValue.text, 'Действие невозможно');
            break;
          case 'validation':
            this.$VueToastify.success(newValue.text, 'Неверные параметры');
            break;
          default:
            this.$VueToastify.error(newValue.text, 'Ошибка');
        }
    });

    return {
      alert,
      info,
      layout,
      isDeleted,
    };
  },
};
</script>

<style lang="stylus">

@import '@/assets/stylus/main.styl';
@import '@/assets/stylus/base/vars.styl'

.vt-notification-container {
  display block !important
}

.v-snack__wrapper
  &.success
    background-color ui-cl-color-eucalypt

  &.error
    background-color ui-cl-color-wild-watermelon

.deleted-account
  display flex
  align-items center
  justify-content center
  width 100%
  height 100vh
</style>

<style lang="css">
@import "../public/css/style.min.css";

::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background-color: darkgrey;
}

::-webkit-scrollbar-thumb {
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
}
</style>
