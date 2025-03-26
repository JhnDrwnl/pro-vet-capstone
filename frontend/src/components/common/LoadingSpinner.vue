<template>
    <div class="spinner-container" :class="{ overlay: isOverlay }">
      <div class="spinner">
        <div class="dot" v-for="i in 8" :key="i" :style="{ '--i': i }"></div>
      </div>
      <div v-if="text" class="spinner-text">{{ text }}</div>
    </div>
  </template>
  
  <script setup>
  // No need to import defineProps as it's a compiler macro
  const props = defineProps({
    text: {
      type: String,
      default: ''
    },
    isOverlay: {
      type: Boolean,
      default: false
    }
  });
  </script>
  
  <style scoped>
  .spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  }
  
  .spinner {
    position: relative;
    width: 60px;
    height: 60px;
  }
  
  .dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #4dabf7;
    animation: fade 1.2s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.15s);
  }
  
  .dot:nth-child(1) {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #3498db;
  }
  
  .dot:nth-child(2) {
    top: 14%;
    right: 14%;
    background-color: #4dabf7;
  }
  
  .dot:nth-child(3) {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background-color: #74c0fc;
  }
  
  .dot:nth-child(4) {
    bottom: 14%;
    right: 14%;
    background-color: #a5d8ff;
  }
  
  .dot:nth-child(5) {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #c5e3ff;
  }
  
  .dot:nth-child(6) {
    bottom: 14%;
    left: 14%;
    background-color: #a5d8ff;
  }
  
  .dot:nth-child(7) {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    background-color: #74c0fc;
  }
  
  .dot:nth-child(8) {
    top: 14%;
    left: 14%;
    background-color: #4dabf7;
  }
  
  .spinner-text {
    margin-top: 12px;
    font-size: 14px;
    color: #3498db;
    font-weight: 500;
  }
  
  @keyframes fade {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  </style>