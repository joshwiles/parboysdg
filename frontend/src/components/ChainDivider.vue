<template>
  <svg
    width="480"
    height="14"
    viewBox="0 0 480 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style="display: block;"
  >
    <circle v-for="i in 24" :key="i" :cx="10 + (i - 1) * 19.13" cy="7" r="4" fill="#C9CDC4" fill-opacity="0.25" />
  </svg>
</template>

<script setup>
</script>
