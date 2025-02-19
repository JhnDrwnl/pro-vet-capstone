<script setup>
import { onMounted, ref } from "vue";
import lottie from "lottie-web";

// ✅ Correct way to access props in <script setup>
const props = defineProps({
  animationPath: {
    type: String,
    required: true, // Must pass the Lottie JSON URL
  },
  width: {
    type: String,
    default: "250px",
  },
  height: {
    type: String,
    default: "250px",
  },
});

const container = ref(null);

// Initialize Lottie animation when component is mounted
onMounted(() => {
  if (!props.animationPath) {
    console.error("Missing animationPath prop!");
    return;
  }

  lottie.loadAnimation({
    container: container.value, // Target div for animation
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: props.animationPath, // ✅ Access via props
  });
});
</script>

<template>
  <div :style="{ width: props.width, height: props.height }" ref="container"></div>
</template>
