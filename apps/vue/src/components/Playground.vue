<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="bg-background text-foreground">
    <header class="sticky top-12 z-10 border-b border-separator backdrop-blur">
      <div class="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <div>
          <p class="text-xs/6 uppercase tracking-[0.2em] text-muted-foreground">
            {{ description }}
          </p>
          <h1 class="font-semibold leading-tight">{{ title }}</h1>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
      <slot />
    </main>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>
