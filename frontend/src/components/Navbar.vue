<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center font-sans fixed w-full top-0 z-50">
      <RouterLink to="/" class="text-red-500 text-xl font-bold">Plume Pawn</RouterLink>
      <div>
        <button class="bg-black hover:bg-gray-900 text-white text-sm px-6 py-2 rounded-full">Connect</button>
      </div>
    </nav>
</template>