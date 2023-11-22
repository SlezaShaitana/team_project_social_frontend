<template>
  <div class="change-password__group" :class="{ fill: password.length > 0 }">
    <input
      class="change-password__input"
      :type="passwordFieldType"
      :id="id"
      v-model.trim="password"
      name="password"
      :class="{
        invalid:
          (v.$dirty && !v.required) ||
          (v.$dirty && !v.minLength) ||
          (v.$dirty && !v.sameAsPassword),
      }"
      @change="v.$touch()"
      placeholder="Повторите пароль"
    />
    <span class="change-password__error" v-if="v.$dirty && !v.required"
      >Обязательно для заполнения</span
    >

    <span
      class="change-password__error"
      v-if="v.$dirty && !v.sameAsPassword && v.required"
      >{{ translationsLang.matchPassword }}</span
    >

    <span
      class="change-password__error"
      v-if="v.$dirty && !v.minLength && v.sameAsPassword"
    >
      {{ translationsLang.validatePass1 }} {{ v.$params.minLength.min }}
      {{ translationsLang.validatePass2 }}
      {{ password.length }}
    </span>

    <div
      class="change-password__password-icon"
      :class="{ active: password.length > 0 }"
      @click="switchVisibility"
    >
      <img src="@/assets/static/img/password-eye.svg" alt="img.svg" />
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import useTranslations from "@/composables/useTranslations";

export default {
  name: "PasswordRepeatField",
  props: {
    value: {
      type: String,
      default: "",
    },
    v: {
      type: Object,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },

  setup(props, { emit }) {
    const passwordFieldType = ref("password");
    const passwordHelperShow = ref(true);
    const { translationsLang } = useTranslations();

    const password = computed({
      get() {
        return props.value;
      },
      set(value) {
        emit("input", value);
      },
    });

    const switchVisibility = () => {
      passwordFieldType.value =
        passwordFieldType.value === "password" ? "text" : "password";
    };

    return {
      passwordFieldType,
      passwordHelperShow,
      translationsLang,
      password,
      switchVisibility,
    };
  },
};
</script>
