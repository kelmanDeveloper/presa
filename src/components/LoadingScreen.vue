<script setup>
import { onMounted, onUnmounted } from "vue";

let interval; // Переменная для интервала сброса анимации
let path; // Переменная для доступа к SVG пути


onMounted(async () => {
  path = document.querySelector(".path");
  interval = setInterval(() => {
    path.style.strokeDashoffset = 1000;
    path.style.animation = "none";
    setTimeout(() => {
      path.style.animation = "draw 8s linear forwards";
    }, 10);
    path.style.strokeDashoffset = "0";
    path.style.animation = "none";
    const svg = document.getElementById("logo");
    svg.classList.add("filled");
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="rotate">
        <svg width="172" height="145" viewBox="0 0 172 145" fill="none">
          <path
            d="M159.6 19.87H128.63L143.1 44.23L144.11 45.94L133.47 63.86L121.8 44.23L107.34 19.87H80.73L95.19 44.23L106.99 64.09L120.16 86.26L109.52 104.19L85.69 64.09H59.28L96.31 126.42L85.7 144.28L38.06 64.09L26.27 44.23L11.79 19.87L0 0H21.21L33.02 19.87L47.48 44.23H73.9L59.43 19.87L47.63 0H171.4L159.6 19.87Z"
            fill="white"
          />
        </svg>
      </div>
</template>

<style scoped>

.rotate {
  animation: pulse 2s ease infinite alternate;
  width: fit-content;
}

svg {
  width: 100px;
  filter: drop-shadow(2px 2px 10px #ad73ff); /* Added glow effect */
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>