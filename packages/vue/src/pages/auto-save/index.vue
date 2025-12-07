<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Playground from "../../components/Playground.vue";
import { useAutoSave } from "../../composables/useAutoSave";

interface FormData {
  title: string;
  content: string;
  tags: string[];
  updatedAt: Date;
}

interface NormalizedFormData {
  title: string;
  content: string;
  tags: string[];
}

const isLoading = ref(true);
const enabled = ref(false);
const originData = ref<FormData | undefined>(undefined);
const currentData = ref<FormData | undefined>(undefined);
const interval = ref(5);
const title = computed({
  get() {
    return currentData.value?.title ?? "";
  },
  set(value) {
    if (currentData.value) {
      currentData.value = {
        ...currentData.value,
        title: value,
        updatedAt: new Date(),
      };
    }
  },
});
const content = computed({
  get() {
    return currentData.value?.content ?? "";
  },
  set(value) {
    if (currentData.value) {
      currentData.value = {
        ...currentData.value,
        content: value,
        updatedAt: new Date(),
      };
    }
  },
});
const tags = computed({
  get() {
    return currentData.value?.tags.join(", ") ?? "";
  },
  set(value) {
    if (currentData.value) {
      currentData.value = {
        ...currentData.value,
        tags: value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        updatedAt: new Date(),
      };
    }
  },
});

const normalizeForComparison = (data: FormData): NormalizedFormData => {
  return {
    title: data.title.trim(),
    content: data.content.trim(),
    tags: data.tags.map((tag) => tag.toLowerCase()).sort(),
  };
};

const saveChanges = async (
  data: FormData,
  normalized: NormalizedFormData,
): Promise<void> => {
  console.log("💾 저장 중...", { data, normalized });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (Math.random() < 0.1) {
    throw new Error("네트워크 에러 발생!");
  }

  console.log("✅ 저장 완료");
};

const { isSaving, hasChanges, lastSavedAt, countdown } = useAutoSave({
  enabled,
  originData,
  currentData,
  interval,
  normalizeForComparison,
  saveChanges,
  onError: (error) => {
    console.error("❌ 저장 실패:", error);
    alert(
      `저장 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
    );
  },
});

// 초기 데이터 로딩 시뮬레이션
onMounted(() => {
  const timer = setTimeout(() => {
    const initialData: FormData = {
      title: "샘플 문서",
      content: "여기에 내용을 입력하세요...",
      tags: ["typescript", "auto-save"],
      updatedAt: new Date(),
    };

    title.value = initialData.title;
    content.value = initialData.content;
    tags.value = initialData.tags.join(", ");
    originData.value = initialData;
    currentData.value = initialData;
    enabled.value = true;
    isLoading.value = false;

    console.log("✅ 데이터 로딩 완료");
    clearTimeout(timer);
  }, 1500);
});
</script>
<template>
  <Playground title="자동 저장 데모" description="Auto Save Playground">
    <div
      v-if="isLoading"
      class="rounded-sm border border-border/60 bg-card shadow-sm"
    >
      <div class="flex flex-col gap-3 px-6 py-8 sm:px-8">
        <div class="flex items-center gap-3 text-muted-foreground">
          <span
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <i aria-hidden class="fa-solid fa-satellite-dish"></i>
          </span>
          <div>
            <p class="text-sm font-semibold text-foreground">
              데이터 로딩 중...
            </p>
            <p class="text-xs text-muted-foreground">잠시만 기다려주세요</p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="h-3 w-1/3 rounded-full bg-muted animate-pulse" />
          <div class="h-3 w-2/3 rounded-full bg-muted animate-pulse" />
          <div class="h-3 w-1/2 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-6">
      <section class="codoodle-card">
        <div class="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-8">
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary"
            >
              <i aria-hidden class="fa-solid fa-chart-line"></i>
            </span>
            <div>
              <h2 class="font-semibold">자동 저장 상태</h2>
              <p class="text-xs text-muted-foreground">
                현재 세션의 상태와 타이머를 확인하세요.
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              class="rounded-md border border-border/60 bg-background px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-muted-foreground">
                상태
              </p>
              <p
                :class="[
                  'mt-1 text-base font-semibold',
                  isSaving ? 'text-primary' : 'text-foreground',
                ]"
              >
                <span v-show="isSaving" class="inline-flex items-center gap-2">
                  <i aria-hidden class="fa-solid fa-floppy-disk"></i>
                  저장 중
                </span>
                <span v-show="!isSaving" class="inline-flex items-center gap-2">
                  <i aria-hidden class="fa-solid fa-clock"></i>
                  대기 중
                </span>
              </p>
            </div>
            <div
              class="rounded-md border border-border/60 bg-background px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-muted-foreground">
                다음 저장까지
              </p>
              <p class="mt-1 font-mono font-semibold">{{ countdown ?? 0 }}s</p>
            </div>
            <div
              class="rounded-md border border-border/60 bg-background px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-muted-foreground">
                마지막 저장
              </p>
              <p class="mt-1 text-base font-semibold">
                {{
                  lastSavedAt ? lastSavedAt.toLocaleTimeString("ko-KR") : "없음"
                }}
              </p>
            </div>
            <div
              class="rounded-md border border-border/60 bg-background px-4 py-3"
            >
              <p class="text-xs uppercase tracking-wide text-muted-foreground">
                변경사항
              </p>
              <p
                :class="[
                  'mt-1 text-base font-semibold',
                  hasChanges ? 'text-orange-600' : 'text-green-600',
                ]"
              >
                {{ hasChanges ? "예" : "아니오" }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="codoodle-card">
        <div class="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-8">
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
            >
              <i aria-hidden class="fa-solid fa-gear"></i>
            </span>
            <div>
              <h2 class="font-semibold">컨트롤</h2>
              <p class="text-xs text-muted-foreground">
                자동 저장을 일시정지하거나 주기를 조정하세요.
              </p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div class="codoodle-input-group">
              <label htmlFor="input-interval" class="text-muted-foreground">
                저장 주기 (초)
              </label>
              <input
                id="input-interval"
                v-model.number="interval"
                type="number"
                min="1"
                max="60"
                class="codoodle-input w-20 text-right"
              />
            </div>
            <button
              :disabled="!enabled"
              class="codoodle-button"
              @click="enabled = false"
            >
              <i aria-hidden class="fa-solid fa-circle-pause"></i>
              일시정지
            </button>
            <button
              :disabled="enabled"
              class="codoodle-button-primary"
              @click="enabled = true"
            >
              <i aria-hidden class="fa-regular fa-circle-play"></i>
              재개
            </button>
          </div>
        </div>
      </section>

      <section class="codoodle-card">
        <div class="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-8">
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary"
            >
              <i aria-hidden class="fa-solid fa-pen-to-square"></i>
            </span>
            <div>
              <h2 class="font-semibold">문서 편집</h2>
              <p class="text-xs text-muted-foreground">
                입력한 내용은 변경 감지 후 자동 저장됩니다.
              </p>
            </div>
          </div>
          <form class="space-y-5" @submit.prevent>
            <div class="space-y-2">
              <label
                htmlFor="input-title"
                class="block text-sm font-medium text-foreground"
              >
                제목
              </label>
              <input
                id="input-title"
                v-model="title"
                type="text"
                class="codoodle-input"
                placeholder="문서 제목을 입력하세요"
              />
            </div>

            <div class="space-y-2">
              <label
                htmlFor="input-content"
                class="block text-sm font-medium text-foreground"
              >
                내용
              </label>
              <textarea
                id="input-content"
                v-model="content"
                rows="10"
                class="codoodle-textarea"
                placeholder="문서 내용을 입력하세요..."
              />
            </div>

            <div class="space-y-2">
              <label
                htmlFor="input-tags"
                class="block text-sm font-medium text-foreground"
              >
                태그 (쉼표로 구분)
              </label>
              <input
                id="input-tags"
                v-model="tags"
                type="text"
                class="codoodle-input"
                placeholder="예: typescript, react, web"
              />
            </div>
          </form>
        </div>
      </section>

      <section class="codoodle-card-secondary">
        <h3
          class="mb-2 flex items-center gap-2 text-sm font-semibold text-secondary-foreground"
        >
          <i aria-hidden class="fa-regular fa-lightbulb"></i>
          <span>사용 방법</span>
        </h3>
        <ul class="space-y-2 text-sm text-secondary-foreground/80">
          <li class="flex items-start gap-2">
            <i
              aria-hidden
              class="fa-solid fa-circle-check mt-0.5 text-secondary-foreground"
            ></i>
            <span>입력 필드를 수정하면 자동으로 변경사항이 감지됩니다.</span>
          </li>
          <li class="flex items-start gap-2">
            <i
              aria-hidden
              class="fa-solid fa-circle-check mt-0.5 text-secondary-foreground"
            ></i>
            <span>설정한 주기마다 자동으로 저장됩니다 (기본 5초).</span>
          </li>
          <li class="flex items-start gap-2">
            <i
              aria-hidden
              class="fa-solid fa-circle-check mt-0.5 text-secondary-foreground"
            ></i>
            <span>저장 중에는 “저장 중” 상태와 아이콘이 표시됩니다.</span>
          </li>
          <li class="flex items-start gap-2">
            <i
              aria-hidden
              class="fa-solid fa-circle-check mt-0.5 text-secondary-foreground"
            ></i>
            <span>
              일시정지/재개 버튼으로 자동 저장을 제어할 수 있습니다.
            </span>
          </li>
          <li class="flex items-start gap-2">
            <i
              aria-hidden
              class="fa-solid fa-circle-check mt-0.5 text-secondary-foreground"
            ></i>
            <span>콘솔(F12)을 열어 저장 로그를 확인하세요.</span>
          </li>
          <li class="flex items-start gap-2">
            <i
              aria-hidden
              class="fa-solid fa-circle-check mt-0.5 text-secondary-foreground"
            ></i>
            <span>10% 확률로 에러가 발생하도록 시뮬레이션되어 있습니다.</span>
          </li>
        </ul>
      </section>
    </div>
  </Playground>
</template>
