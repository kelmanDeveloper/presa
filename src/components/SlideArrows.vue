<template>
  <div class="slide-arrows">
    <p>
      Управление презентацией <br />
      с помощью клавиш:
    </p>
    <svg
      width="239"
      height="52"
      viewBox="0 0 269 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Левая стрелка -->
      <path
        class="arrow-left"
        d="M79.9506 11.7843V70.5271C79.9506 75.1616 76.1934 78.9189 71.5589 78.9189H12.8156C8.18106 78.9189 4.42383 75.1616 4.42383 70.5271V11.7843C4.42383 7.14982 8.18106 3.39258 12.8156 3.39258H71.5589C76.1934 3.39205 79.9506 7.1493 79.9506 11.7843Z"
        fill="#003555"
        stroke="#04A1FF"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="arrow-left-inner"
        d="M37.99 53.7441L25.4023 41.156M25.4023 41.156L37.99 28.5684M25.4023 41.156H58.9699"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Правая стрелка -->
      <path
        class="arrow-right"
        d="M189.045 62.1354V11.7843C189.045 7.14982 192.802 3.39258 197.437 3.39258H256.18C260.814 3.39258 264.572 7.14982 264.572 11.7843V70.5271C264.572 75.1616 260.814 78.9189 256.18 78.9189H197.437C192.802 78.9189 189.045 75.1616 189.045 70.5271V62.1354Z"
        fill="#003555"
        stroke="#04A1FF"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        class="arrow-right-inner"
        d="M231.005 28.5678L243.592 41.1555M243.592 41.1555L231.005 53.7436M243.592 41.1555H210.025"
        stroke="#04a1ff"
        stroke-width="2"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.slide-arrows {
  position: absolute;
  width: 100%;
  bottom: 24px;
  text-align: center;
}

p {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  line-height: 130%; /* 26px */
  margin-bottom: 16px;
}

/* Анимация для левой стрелки */
.arrow-left {
  animation: blink 0.7s infinite alternate;
}

/* Анимация для правой стрелки */
.arrow-right {
  animation: blink 0.7s infinite alternate;
  animation-delay: 0.8s;
}

.arrow-left-inner {
  animation: blink-inner 0.7s infinite alternate;
}

.arrow-right-inner {
  animation: blink-inner 0.7s infinite alternate;
  animation-delay: 0.8s;
}

@keyframes blink-inner {
  0% {
    stroke: #04a1ff;
  }
  100% {
    stroke: #dcdcdc;
  }
}

/* Ключевые кадры для мигания левой стрелки */

/* Ключевые кадры для мигания правой стрелки */
@keyframes blink {
  0% {
    fill: #003555;
  }
  100% {
    fill: #04a1ff;
  }
}
</style>
