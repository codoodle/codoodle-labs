<template>
  <div class="min-h-dvh grid grid-cols-1 grid-rows-[auto_1fr]">
    <div
      class="bg-background border-b border-separator row-[1/2] sticky top-0 z-20 h-12"
    >
      <div
        class="mx-auto max-lg:max-w-2xl max-lg:border-x max-sm:border-x-0 border-separator"
      >
        <div class="p-3 flex items-center gap-4">
          <div>
            <RouterLink to="/" aria-label="홈으로 이동">
              <img
                alt="Logo"
                aria-hidden="true"
                width="24"
                height="24"
                class="dark:invert"
                src="/images/codoodle.png"
              />
              <span class="sr-only">Codoodle</span>
            </RouterLink>
          </div>
          <div class="ml-auto flex items-center gap-4">
            <nav class="flex items-center gap-4 text-sm" />
            <i class="fa-brands fa-vuejs"></i>
          </div>
        </div>
      </div>
    </div>
    <div
      class="self-stretch grid justify-center grid-cols-1 grid-rows-1 lg:grid-cols-[2.5rem_minmax(0,var(--breakpoint-xl))_2.5rem] row-[2/3]"
    >
      <div
        class="row-[1/2] lg:col-[2/3] border-x max-sm:border-x-0 border-separator"
      >
        <div class="mx-auto max-lg:max-w-2xl">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>
