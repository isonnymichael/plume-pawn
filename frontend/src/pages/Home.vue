<script setup>
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/home/HeroSection.vue'
import FeatureSection from '../components/home/FeatureSection.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="bg-offwhite min-h-screen">
    <Navbar />
    <HeroSection />
    <FeatureSection />
    <Footer />
  </div>
</template>

<style scoped>
.bg-offwhite {
  background-color: #F9F9F9;
}
</style>
