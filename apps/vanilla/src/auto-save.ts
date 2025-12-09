import "./main.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faCirclePlay, faLightbulb } from "@fortawesome/free-regular-svg-icons";
import {
  faChartLine,
  faCircleCheck,
  faCirclePause,
  faClock,
  faFloppyDisk,
  faGear,
  faIceCream,
  faPenToSquare,
  faSatelliteDish,
} from "@fortawesome/free-solid-svg-icons";
import { computed, ref, watch } from "@vue/reactivity";
import { useAutoSave } from "./libs/useAutoSave";

dom.watch();
library.add(
  faIceCream,
  faCirclePlay,
  faLightbulb,
  faSatelliteDish,
  faChartLine,
  faGear,
  faPenToSquare,
  faCirclePause,
  faFloppyDisk,
  faClock,
  faCircleCheck,
);

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

const elWrapLoading = document.getElementById("wrap-loading")!;
const elWrapContent = document.getElementById("wrap-content")!;
const elWrapSavingStatus = document.getElementById("warp-saving-status")!;
const elLabelSaving = document.getElementById("label-saving")!;
const elLabelWaiting = document.getElementById("label-waiting")!;
const elLabelCountdown = document.getElementById("label-countdown")!;
const elLabelLastSavedAt = document.getElementById("label-last-saved-at")!;
const elLabelHasChanges = document.getElementById("label-has-changes")!;
const elButtonPause = document.getElementById(
  "button-pause",
) as HTMLButtonElement;
const elButtonResume = document.getElementById(
  "button-resume",
) as HTMLButtonElement;
const elInputInterval = document.getElementById(
  "input-interval",
) as HTMLInputElement;
const elInputTitle = document.getElementById("input-title") as HTMLInputElement;
const elInputContent = document.getElementById(
  "input-content",
) as HTMLTextAreaElement;
const elInputTags = document.getElementById("input-tags") as HTMLInputElement;

watch(
  isLoading,
  (newValue) => {
    if (newValue) {
      elWrapLoading.style.display = "block";
      elWrapContent.style.display = "none";
    } else {
      elWrapLoading.style.display = "none";
      elWrapContent.style.display = "flex";
    }
  },
  { immediate: true },
);

watch(
  isSaving,
  (newValue) => {
    if (newValue) {
      elWrapSavingStatus.classList.add("text-primary");
      elLabelSaving.style.display = "inline-flex";
      elLabelWaiting.style.display = "none";
    } else {
      elWrapSavingStatus.classList.remove("text-primary");
      elLabelSaving.style.display = "none";
      elLabelWaiting.style.display = "inline-flex";
    }
  },
  { immediate: true },
);

watch(
  countdown,
  (newValue) => {
    elLabelCountdown.textContent = `${newValue ?? 0}s`;
  },
  { immediate: true },
);

watch(
  lastSavedAt,
  (newValue) => {
    elLabelLastSavedAt.textContent = newValue
      ? newValue.toLocaleTimeString("ko-KR")
      : "없음";
  },
  { immediate: true },
);

watch(
  hasChanges,
  (newValue) => {
    elLabelHasChanges.textContent = newValue ? "예" : "아니오";
    if (newValue) {
      elLabelHasChanges.classList.add("text-orange-600");
      elLabelHasChanges.classList.remove("text-green-600");
    } else {
      elLabelHasChanges.classList.add("text-green-600");
      elLabelHasChanges.classList.remove("text-orange-600");
    }
  },
  { immediate: true },
);

watch(
  enabled,
  (newValue) => {
    if (newValue) {
      elButtonPause.disabled = false;
      elButtonResume.disabled = true;
    } else {
      elButtonPause.disabled = true;
      elButtonResume.disabled = false;
    }
  },
  { immediate: true },
);

elInputInterval.value = interval.value.toString();
elInputInterval.addEventListener("change", (event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value, 10);
  if (!isNaN(value) && value >= 1 && value <= 60) {
    interval.value = value;
  } else {
    target.value = interval.value.toString();
  }
});
elButtonPause.addEventListener("click", () => {
  enabled.value = false;
  elButtonPause.disabled = true;
  elButtonResume.disabled = false;
});
elButtonResume.addEventListener("click", () => {
  enabled.value = true;
  elButtonPause.disabled = false;
  elButtonResume.disabled = true;
});

elInputTitle.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  title.value = target.value;
});

elInputContent.addEventListener("input", (event) => {
  const target = event.target as HTMLTextAreaElement;
  content.value = target.value;
});

elInputTags.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement;
  tags.value = target.value;
});

// 초기 데이터 로딩 시뮬레이션
(() => {
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

    elInputTitle.value = title.value;
    elInputContent.value = content.value;
    elInputTags.value = tags.value;

    console.log("✅ 데이터 로딩 완료");
    clearTimeout(timer);
  }, 1500);
})();
