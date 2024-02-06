<template>
  <div v-if="weather" class="weather">
    <h4 class="weather__city">{{ weather.name }}</h4>
    <div class="weather__top">
      <div class="weather__clouds">
        <img
          :src="`https://openweathermap.org/img/wn/${weather.icon}.png`"
          :alt="weather.icon"
        />
        <span class="weather__temp">{{ weather.temp }}°C</span>
      </div>
      <div>
        <div class="weather__window">{{ getNameByIdWeather[0].text }}</div>
        <div class="weather__humidity">
          {{ translationsLang.weatherHumidity }} {{ weather.humidity }}%
        </div>
        <div class="weather__humidity">
          {{ translationsLang.weatherWind }} {{ weather.windSpeed }}м/с
        </div>
      </div>
    </div>
    <div class="weather__minmax">
      <div>
        {{ translationsLang.weatherMinTemp }}
        <span>{{ weather.temp_min }}°C</span>
      </div>
      <div>
        {{ translationsLang.weatherMaxTemp }}
        <span>{{ weather.temp_max }}°C</span>
      </div>
    </div>
  </div>
  <div class="weather" v-else>
    <p>{{ translationsLang.weatherLoading }}</p>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import useTranslations from "@/composables/useTranslations";
import translateWeather from "@/utils/translateWeather";

export default {
  name: "WeatherBlock",

  setup() {
    const weather = ref(null);

    const { translationsLang } = useTranslations();

    const getNameByIdWeather = computed(() =>
      translateWeather.filter((item) => item.id === weather.value.id)
    );

    onMounted(() => {
      getWeather();
    });

    const getWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `/api/weather/get?lat=${lat}&lon=${lon}`;
            // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=5308edc68a042a4788ed4de34ae08480`;

            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                weather.value = {
                  temp: Math.round(data.main.temp),
                  temp_min: Math.round(data.main.temp_min),
                  temp_max: Math.round(data.main.temp_max),
                  cloudiness: data.clouds.all,
                  windSpeed: data.wind.speed,
                  name: data.name,
                  icon: data.weather[0].icon,
                  humidity: data.main.humidity,
                  id: data.weather[0].id,
                };
              })
              .catch((error) => console.log(error));
          },
          () => {
            console.log("Не удалось получить геолокацию");
          }
        );
      }
    };

    return {
      weather,
      translationsLang,
      getNameByIdWeather,
      getWeather,
    };
  },
};
</script>

<style lang="stylus">
@import '@/assets/stylus/base/vars.styl'

.weather
  display flex
  align-items center
  flex-direction column
  justify-content center
  color ui-cl-color-grey-color
  &__city
    font-size 20px
    text-transform uppercase
    font-weight 900
    margin-bottom 10px
  &__title
    color ui-cl-color-grey-color
  &__top
    display flex
    align-items center
    justify-content flex-start
    gap 5px
    font-size font-size-small-medium
    margin-bottom 10px
  &__humidity
    color #a4a4a4
  &__temp
    font-size 24px
    font-weight font-weight-bold
  &__clouds
    display flex
    align-items center
    gap 5px
    margin-right 15px
  &__minmax
    display flex
    align-items center
    gap 10px
    font-size font-size-small-medium
    color #000
    span
      display block
      color #a4a4a4

@media (min-width: 320px) and (max-width: 768px)
  .weather
    display none
</style>
