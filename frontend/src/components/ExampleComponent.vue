<template>
  <div class="example-component">
    <h3 class="text-xl font-semibold mb-4">Example Component</h3>
    <p class="text-gray-600 mb-4">
      This is an example component to show the structure. You can delete this and create your own components.
    </p>
    <button 
      @click="count++"
      class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Clicked {{ count }} times
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.example-component {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
}
</style>
