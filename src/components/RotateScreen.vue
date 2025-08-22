<template>
  <div v-if="isPortrait" class="rotate-message">
    <div class="rotate-message-inner">
      <video
        src="/slides/rotate.mp4"
        autoplay
        muted
        loop
        preload="auto"
      ></video>
    </div>
  </div>
</template> 


<script>
import { defineComponent } from "vue";
export default defineComponent({
  data() {
    return {
      isPortrait: false,
      isMobile: false
    };
  },
  methods: {
    checkOrientation() {
      this.isPortrait = window.innerHeight > window.innerWidth;
    },
  },
  mounted() {
    this.checkOrientation();
    window.addEventListener("resize", this.checkOrientation);
    window.addEventListener("orientationchange", this.checkOrientation);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkOrientation);
    window.removeEventListener("orientationchange", this.checkOrientation);
  },
});
</script>


<style scoped>
.rotate-message {
  position: fixed;
  z-index: 2;
  height: 100dvh;
  width: 100%;
  background: #000;
  .rotate-message-inner {
    position: relative;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
      transform: scale(1.55);
    }
  }
}
</style>
  