<template>
  <div class="wrapper">
    <!-- Показываем экран загрузки до завершения загрузки всех файлов -->
    <LoadingScreen v-if="isLoading" :isLoading="isLoading" />

    <RotateScreen v-if="!isLoading" />
    <VolumeSwitcher v-if="!isLoading" />
    <Carousel
      ref="carousel"
      v-if="!isLoading"
      @slide-change="handleSlideChange"
    >
      <Slide v-for="(slide, index) in slides" :key="slide.id">
        <div class="carousel__item">
          <video
            @click="activate"
            v-if="index === slides.length - 1"
            :src="slide.cachedVideo || slide.video"
            autoplay
            muted
            loop
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen"
            class="carousel__video link"
          ></video>
          <video
            v-else
            :src="slide.cachedVideo || slide.video"
            autoplay
            muted
            loop
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen"
            class="carousel__video"
          ></video>
        </div>
      </Slide>
    </Carousel>
    <SlideArrows v-if="!isLoading && showArrows && !isMobile" />
    <SwipeSlide v-if="!isLoading && showSwipeFinger && isMobile" />
  </div>
</template>




<script>
import { defineComponent } from "vue";
import "vue3-carousel/dist/carousel.css";
import { Carousel, Slide } from "vue3-carousel";
import RotateScreen from "./components/RotateScreen.vue";
import SlideArrows from "./components/SlideArrows.vue";
import SwipeSlide from "./components/SwipeSlide.vue";
import VolumeSwitcher from "./components/VolumeSwitcher.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import videoCache from "./services/videoCache";
export default defineComponent({
  components: {
    RotateScreen,
    Carousel,
    SlideArrows,
    VolumeSwitcher,
    Slide,
    SwipeSlide,
    LoadingScreen,
    progressPercentage: 0,
    cachedRotate: null,
    cachedAudio: null,
  },
  data() {
    return {
      slides: [
        { id: 1, video: "/slides/slide-1.mp4" },
        { id: 2, video: "/slides/slide-2.mp4" },
        { id: 3, video: "/slides/slide-3.mp4" },
        { id: 4, video: "/slides/slide-4.mp4" },
        { id: 5, video: "/slides/slide-5.mp4" },
        { id: 6, video: "/slides/slide-6.mp4" },
        { id: 7, video: "/slides/slide-7.mp4" },
        { id: 8, video: "/slides/slide-8.mp4" },
      ],
      isSwipeDetected: false,
      showArrows: false, // Контроль показа стрелок
      showSwipeFinger: false, // Контроль показа жестов
      hasChangedSlide: false, // Учитывает, был ли слайд переключен
      inactivityTimer: null, // Таймер для отслеживания бездействия
      isMobile: false, // Определяет, мобильное ли устройство
      isLoading: true, // Показываем экран загрузки по умолчанию
    };
  },
  methods: {
    activate() {
      window.open("https://highnet.host/activate", "_blank");
    },

    stopNavigate() {
      document.querySelectorAll("video").forEach((video) => {
        video.addEventListener("play", (e) => e.preventDefault());
        video.addEventListener("pause", (e) => e.preventDefault());
        video.controls = false; // Убедитесь, что управление выключено
      });
    },

    handleLoadComplete() {
      this.isLoading = false;
      console.log("Загрузка завершена!");
    },

    async loadMediaFromNetwork(url, type) {
      try {
        const response = await fetch(url);
        const mediaBlob = await response.blob();
        await videoCache.saveVideo(url, mediaBlob); // Сохраняем в кэш
        return URL.createObjectURL(mediaBlob); // Возвращаем объект URL для использования
      } catch (error) {
        console.error(`Ошибка загрузки ${type}: ${url}`, error);
      }
    },

    // Предзагрузка первых двух слайдов, rotate.mp4 и sound.mp3
    async preloadMedia() {
      try {
        // Загружаем первые два слайда
        const firstTwoSlides = this.slides.slice(0, 3);
        const firstTwoSlidesPromises = firstTwoSlides.map((slide) =>
          videoCache
            .getVideo(slide.video)
            .then((cachedVideo) => {
              slide.cachedVideo = URL.createObjectURL(cachedVideo);
            })
            .catch(() => this.loadMediaFromNetwork(slide.video, "видео"))
        );

        // Загружаем rotate.mp4
        const rotateCachePromise = videoCache
          .getVideo("/slides/rotate.mp4")
          .then((cachedRotate) => {
            this.cachedRotate = URL.createObjectURL(cachedRotate);
          })
          .catch(() =>
            this.loadMediaFromNetwork("/slides/rotate.mp4", "rotate")
          );

        // Загружаем аудио
        const audioCachePromise = videoCache
          .getVideo("/sound.mp3")
          .then((cachedAudio) => {
            this.cachedAudio = URL.createObjectURL(cachedAudio);
          })
          .catch(() => this.loadMediaFromNetwork("/sound.mp3", "аудио"));

        // Ждем завершения всех обязательных загрузок
        await Promise.all([
          ...firstTwoSlidesPromises,
          rotateCachePromise,
          audioCachePromise,
        ]);

        console.log("Обязательные медиа-файлы загружены");

        // Фоновая загрузка остальных слайдов
        this.preloadRemainingSlides();
      } catch (err) {
        console.error("Ошибка предзагрузки:", err);
      }
    },

    // async preloadRotateVideo() {
    //   return new Promise((resolve, reject) => {
    //     const video = document.createElement("video");
    //     video.src = "/slides/rotate.mp4";
    //     video.preload = "auto";

    //     video.onloadeddata = () => {
    //       this.cachedRotate = video.src;
    //       resolve();
    //     };

    //     video.onerror = (err) => {
    //       console.error("Ошибка загрузки rotate.mp4:", err);
    //       reject(err);
    //     };
    //   });
    // },

    // Фоновая загрузка оставшихся слайдов
    preloadRemainingSlides() {
      const remainingSlides = this.slides.slice(2);
      remainingSlides.forEach((slide) => {
        videoCache
          .getVideo(slide.video)
          .then((cachedVideo) => {
            slide.cachedVideo = URL.createObjectURL(cachedVideo);
          })
          .catch(() => this.loadMediaFromNetwork(slide.video, "видео"));
      });
    },

    // Обработчик нажатий клавиш для управления каруселью
    handleKeyDown(event) {
      if (
        event.code === "ArrowLeft" ||
        event.code === "KeyA" ||
        event.code === "Backspace"
      ) {
        this.$refs.carousel.prev(); // Переключение на предыдущий слайд
        this.hideArrows(); // Прятать стрелки при переключении
      } else if (
        event.code === "ArrowRight" ||
        event.code === "KeyD" ||
        event.code === "Space"
      ) {
        this.$refs.carousel.next(); // Переключение на следующий слайд
        this.hideArrows(); // Прятать стрелки при переключении
      }
    },

    // Проверка устройства (мобильное или компьютер)
    checkIfMobile() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isMobile = /android|ipad|iphone|ipod/i.test(userAgent); // Учитываем и планшеты
    },

    startSwipeTracking() {
      let startX = 0;
      let startY = 0;
      let isSwiping = false;

      const onTouchStart = (event) => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isSwiping = true;
      };

      const onTouchMove = (event) => {
        if (!isSwiping) return;

        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        // Проверяем, что свайп был горизонтальным (значение deltaX больше deltaY)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          this.isSwipeDetected = true; // Свайп обнаружен
          this.hideSwipeHint(); // Прячем подсказку
          isSwiping = false; // Останавливаем отслеживание свайпа
        }
      };

      const onTouchEnd = () => {
        isSwiping = false;
      };

      // Добавляем глобальные слушатели событий touch
      window.addEventListener("touchstart", onTouchStart);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    },

    hideSwipeHint() {
      // Прячем подсказку о свайпе
      this.showSwipeFinger = false;
    },

    // Обработка изменения слайда (включая свайп)
    handleSlideChange() {
      if (!this.hasChangedSlide) {
        this.hasChangedSlide = true; // Отметка, что был переключен хотя бы один слайд
      }
      this.hideArrows(); // Скрываем стрелки и жесты при любом переключении слайда
    },

    // Показать стрелки через 30 секунд бездействия
    startInactivityTimer() {
      this.inactivityTimer = setTimeout(() => {
        if (!this.hasChangedSlide) {
          this.showArrows = true;
          this.showSwipeFinger = true;
        }
      }, 30000);
    },

    // Сброс таймера бездействия
    resetInactivityTimer() {
      clearTimeout(this.inactivityTimer);
      this.startInactivityTimer();
    },

    // Скрыть стрелки и жесты
    hideArrows() {
      this.showArrows = false;
      this.showSwipeFinger = false; // Скрываем SwipeSlide при переключении слайда
      clearTimeout(this.inactivityTimer); // Останавливаем таймер, если пользователь переключил слайд
    },
  },
  mounted() {
    this.preloadMedia()
      .then(this.handleLoadComplete)
      .catch((error) => console.error(error));

    this.checkIfMobile();
    this.startSwipeTracking(); // Начинаем отслеживание свайпа по экрану
    window.addEventListener("keydown", this.handleKeyDown); // Добавляем слушатель для нажатия клавиш
    this.startInactivityTimer(); // Запускаем таймер отсчёта для показа стрелок
    this.stopNavigate();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect(); // Отключаем наблюдатель при демонтаже
    }
    window.removeEventListener("keydown", this.handleKeyDown); // Убираем слушатель
    clearTimeout(this.inactivityTimer); // Очищаем таймер при демонтаже компонента
  },
});
</script>


<style>
.wrapper {
  background: #000;
  position: relative;
  display: grid;
  place-items: center;
  height: 100%;
  .carousel {
    height: 100%;
    .carousel__item {
      min-height: 200px;
      width: 100%;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      .carousel__slide {
        padding: 10px;
      }

      .carousel__prev,
      .carousel__next {
        box-sizing: content-box;
        border: 5px solid white;
      }

      .carousel__prev.carousel__prev--disabled,
      .carousel__next.carousel__next--disabled {
        display: none;
      }
      a {
        width: 100%;
      }
      .carousel__video {
        object-fit: contain;
        width: 100%;
        height: 100%;
      }
    }
  }
}

.link {
  cursor: pointer;
}

.loader {
  position: absolute;
  z-index: 1;
  width: 80px;
  height: 80px;
  left: calc(50% - 40px);
  top: calc(50% - 40px);
  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: 50%;
  color: #5ca3e1;
}
.loader:before,
.loader:after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  transform: rotateX(70deg);
  animation: 1s spin linear infinite;
}
.loader:after {
  color: #816bfa;
  transform: rotateY(70deg);
  animation-delay: 0.4s;
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotateZ(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotateZ(360deg);
  }
}

@keyframes rotateccw {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

@keyframes spin {
  0%,
  100% {
    box-shadow: 0.2em 0px 0 0px currentcolor;
  }
  12% {
    box-shadow: 0.2em 0.2em 0 0 currentcolor;
  }
  25% {
    box-shadow: 0 0.2em 0 0px currentcolor;
  }
  37% {
    box-shadow: -0.2em 0.2em 0 0 currentcolor;
  }
  50% {
    box-shadow: -0.2em 0 0 0 currentcolor;
  }
  62% {
    box-shadow: -0.2em -0.2em 0 0 currentcolor;
  }
  75% {
    box-shadow: 0px -0.2em 0 0 currentcolor;
  }
  87% {
    box-shadow: 0.2em -0.2em 0 0 currentcolor;
  }
}
</style>
