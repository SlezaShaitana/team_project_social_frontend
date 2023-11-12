<template>
  <div class="settings-security">
    <div class="settings-security__block">
      <div class="settings-security__mail">
        <h3 class="settings-security__title">E-mail:</h3>

        <input
          class="settings-security__value"
          v-model="changeEmail"
          autocomplete="off"
        />

        <button
          class="settings-security__btn"
          @click.prevent="openModal('email')"
        >
          {{ translationsLang.settingBtnChange }}
        </button>
      </div>

      <h3 class="settings-security__title">
        {{ translationsLang.settingPasswordLabel }}
      </h3>
      <input
        class="settings-security__value not-first"
        type="password"
        v-model="password"
        :placeholder="translationsLang.settingPasswordPlaceholder"
        autocomplete="new-password"
      />
      <input
        class="settings-security__value"
        type="password"
        v-model="passwordTwo"
        :placeholder="translationsLang.settingPasswordPlaceholder2"
        autocomplete="new-password"
      />
      <button
        class="settings-security__btn"
        @click.prevent="openModal('password')"
      >
        {{ translationsLang.settingBtnChange }}
      </button>
    </div>

    <modal v-model="modalShow">
      <p v-if="modalText">{{ modalText }}</p>

      <template v-slot:actions>
        <button @click="closeModal()">{{
          translationsLang.yes
        }}</button>
      </template>
    </modal>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import useTranslations from "@/composables/useTranslations";
import Modal from "@/components/Modal.vue";
import auth from "@/requests/auth";

export default {
  name: "SettingsSecurity",
  components: { Modal },

  setup() {
    const store = useStore();
    const router = useRouter();
    const modalShow = ref(false);
    const modalText = ref("");
    const changeEmail = ref("");
    const password = ref("");
    const passwordTwo = ref("");
    const { translationsLang } = useTranslations();

    const getInfo = computed(() => store.getters["profile/info/getInfo"]);

    onMounted(() => {
      setTimeout(() => {
        changeEmail.value = getInfo.value?.email;
        password.value = "";
        passwordTwo.value = "";
      }, 300);
    });

    const closeModal = () => {
      modalShow.value = false;
    };

    const openModal = async (id) => {
      if (id === "email") {
        await auth
          .requestChangeEmailLink({ email: changeEmail.value })
          .then(() => {
            modalText.value = `${translationsLang.settingModalEmailChange} ${changeEmail.value}`;
            modalShow.value = true;
            setTimeout(() => {
              store.dispatch("auth/api/logout").finally(() => {
                router.push("/login");
              });
            }, 3000);
          });
      }

      if (id === "password") {
        if (password.value === passwordTwo.value) {
          await auth
            .requestChangePasswordLink({ password: passwordTwo.value })
            .then(() => {
              modalText.value = `${translationsLang.settingModalPasswordChange}`;
              modalShow.value = true;
            });
        }
      }
    };

    return {
      modalShow,
      modalText,
      changeEmail,
      password,
      passwordTwo,
      translationsLang,
      getInfo,
      closeModal,
      openModal,
    };
  },
};
</script>

<style lang="stylus">
@import '@/assets/stylus/base/vars.styl'


.settings-security__block
  background ui-cl-color-white-theme
  box-shadow box-shadow-main
  display flex
  flex-direction column
  width 100%
  padding 30px
  font-size font-size-downdefault
  border-radius border-big-radius

  &+&
    margin-top 20px

.settings-security__mail
  margin-bottom 30px

.settings-security__btn
  display block
  min-width 180px
  max-width 180px
  color ui-cl-color-eucalypt
  border-radius border-small
  text-align center
  background ui-cl-color-white-theme
  border 1px solid ui-cl-color-eucalypt
  font-size font-size-small-medium
  padding 10px
  @media (any-hover: hover)
    &:hover
      background ui-cl-color-eucalypt
      color ui-cl-color-white-theme

.settings-security__title
  color ui-cl-color-full-black
  margin-bottom 15px
  font-family 'Exo', Arial, sans-serif
  font-size 24px
  font-weight font-weight-bold

.form__input_stylus
  color ui-cl-color-full-black

.settings-security__value
  display block
  width 100%
  color ui-cl-color-767676
  border-radius border-small
  background ui-cl-color-white-theme
  border 1px solid ui-cl-color-ababab
  font-size font-size-small-medium
  padding 10px 15px
  margin-bottom 15px
</style>
