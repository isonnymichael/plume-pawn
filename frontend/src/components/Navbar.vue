<script setup>
import { RouterLink } from 'vue-router'
import WalletConnect from './WalletConnect.vue'
</script>

<template>
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center font-sans fixed w-full top-0 z-50">
      <RouterLink to="/" class="text-red-500 text-xl font-bold">Plume Pawn</RouterLink>
      <div>
         <WalletConnect /> 
      </div>
    </nav>
</template>