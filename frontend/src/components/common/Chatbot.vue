<template>
  <div>
    <!-- Dialogflow Messenger will be inserted here by the script -->
    <dotlottie-player 
      id="custom-chat-bubble" 
      src="https://lottie.host/b202c548-8602-4982-a7dc-8f7db1df371f/SOWn3JnOYp.lottie" 
      background="transparent" 
      speed="1" 
      style="position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px; z-index: 1000; cursor: pointer;" 
      loop 
      autoplay
    ></dotlottie-player>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Load Lottie player
const loadLottiePlayer = () => {
  const script = document.createElement('script');
  script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
  script.type = "module";
  document.head.appendChild(script);
};

// Initialize Dialogflow Messenger
const initializeDialogflow = () => {
  // Add Dialogflow Messenger script
  const script = document.createElement('script');
  script.src = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';
  script.async = true;
  document.head.appendChild(script);

  // Add Dialogflow Messenger styles
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css';
  document.head.appendChild(link);

  // Create and insert Dialogflow Messenger element
  script.onload = () => {
    const dfMessenger = document.createElement('df-messenger');
    dfMessenger.setAttribute('project-id', 'provetbot-448117');
    dfMessenger.setAttribute('agent-id', 'f6bb4117-de93-4e51-a7e5-873dffd92a6c');
    dfMessenger.setAttribute('language-code', 'en');
    dfMessenger.setAttribute('max-query-length', '-1');
    dfMessenger.setAttribute('chat-title', 'training-data-probot');

    document.body.appendChild(dfMessenger);

    // Hide the default chat bubble and bind the Lottie animation
    const chatBubble = document.querySelector('df-messenger');
    chatBubble.style.display = 'none';

    const customBubble = document.getElementById('custom-chat-bubble');
    customBubble.addEventListener('click', () => {
      chatBubble.style.display = 'block';
      chatBubble.setAttribute('opened', 'true');
      customBubble.style.display = 'none';
    });
  };
};

// On component mount
onMounted(() => {
  loadLottiePlayer();
  initializeDialogflow();
});
</script>
