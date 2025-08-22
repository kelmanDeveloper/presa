<template>
  <div v-if="isLoading">
    <div class="loader"></div>
  </div>
  <div class="preloader" v-else>
    <audio preload="auto" src="/sound.mp3" loop></audio>
    <video v-for="(video, index) in newVideos" :key="index" :src="video" preload="auto"></video>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  onLoadComplete: Function
});

const newVideos = ref([]);
const isLoading = ref(true);

const videos = [
  "/slides/slide-1.mp4",
  "/slides/slide-2.mp4",
  "/slides/slide-3.mp4",
  "/slides/slide-4.mp4",
  "/slides/slide-5.mp4",
  "/slides/slide-6.mp4",
  "/slides/slide-7.mp4",
  "/slides/slide-8.mp4",
  "/slides/rotate.mp4",
];

const audio = ["/sound.mp3"];

function preloadAudio(audioUrls) {
  return Promise.all(
    audioUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.oncanplaythrough = resolve; // Аудио полностью загружено
        audio.onerror = reject;
      });
    })
  );
}

function preloadVideos(videoUrls) {
  return Promise.all(
    videoUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.src = url;
        video.preload = "auto";
        video.oncanplaythrough = resolve; // Видео полностью загружено и готово к воспроизведению
        video.onerror = reject;
      });
    })
  );
}

onMounted(async () => {
  try {
    // Предварительно загружаем аудио и видео
    await preloadAudio(audio);
    await preloadVideos(videos);

    // Записываем новые видео в состояние
    newVideos.value = videos;
    
    // Отключаем состояние загрузки
    isLoading.value = false;

    // Вызываем пропс, если это необходимо
    if (props.onLoadComplete && typeof props.onLoadComplete === 'function') {
      props.onLoadComplete(); 
    }
  } catch (error) {
    console.error("Ошибка загрузки ресурсов:", error);
  }
});
</script>


<style scoped>
.preloader {
  width: 0;
  height: 0;
  visibility: hidden
}
video{
  width: 0;
  height: 0;
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
  background: #200035;
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
@keyframes spin {
  0%, 100% {
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
