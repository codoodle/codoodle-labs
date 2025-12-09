import { computed, ref, watch, type Ref } from "@vue/reactivity";
import { cloneDeep, isEqual } from "lodash";

export interface UseAutoSaveOptions<TData, TNormalized> {
  /**
   * 자동 저장 활성화 여부
   */
  enabled: Ref<boolean>;
  /**
   * 원본 데이터
   */
  originData: Ref<TData | undefined>;
  /**
   * 현재 데이터
   */
  currentData: Ref<TData | undefined>;
  /**
   * 자동 저장 주기 (초)
   */
  interval: Ref<number>;
  /**
   * 데이터 비교를 위한 정규화 함수
   */
  normalizeForComparison: (data: TData) => TNormalized;
  /**
   * 변경된 데이터를 저장하는 함수
   */
  saveChanges: (
    currentData: TData,
    normalizedData: TNormalized,
  ) => Promise<void>;
  /**
   * 저장 실패 시 호출할 콜백 함수
   */
  onError?: (error: unknown) => void;
}

export function useAutoSave<TData, TNormalized>({
  enabled,
  originData,
  currentData,
  interval,
  normalizeForComparison,
  saveChanges,
  onError,
}: UseAutoSaveOptions<TData, TNormalized>) {
  let timer: number | null = null;
  const savedSnapshot = ref<TData | undefined>(
    originData.value ? cloneDeep(originData.value) : undefined,
  );
  const countdown = ref(0);
  const isSaving = ref(false);
  const lastSavedAt = ref<Date | null>(null);
  const normalizedSaved = computed(() =>
    savedSnapshot.value
      ? normalizeForComparison(savedSnapshot.value)
      : undefined,
  );
  const normalizedCurrent = computed(() =>
    currentData.value ? normalizeForComparison(currentData.value) : undefined,
  );
  const hasChanges = computed(() => {
    if (!normalizedSaved.value || !normalizedCurrent.value) {
      return false;
    }
    return !isEqual(normalizedSaved.value, normalizedCurrent.value);
  });
  const isEnabled = computed(
    () =>
      enabled.value &&
      originData.value !== undefined &&
      currentData.value !== undefined,
  );

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const saveIfChanged = async () => {
    if (!isEnabled.value || isSaving.value || !hasChanges.value) {
      return;
    }

    isSaving.value = true;
    try {
      await saveChanges(currentData.value!, normalizedCurrent.value!);
      savedSnapshot.value = cloneDeep(currentData.value);
      lastSavedAt.value = new Date();
    } catch (error) {
      onError?.(error);
    } finally {
      isSaving.value = false;
    }
  };

  watch(
    () => originData.value,
    (newOriginData) => {
      savedSnapshot.value = newOriginData
        ? cloneDeep(newOriginData)
        : undefined;
    },
  );

  watch(
    () => currentData.value,
    () => {
      if (isEnabled.value) {
        clearTimer();
        countdown.value = interval.value;
      }
    },
  );

  watch(
    () => isEnabled.value,
    () => {
      if (isEnabled.value) {
        clearTimer();
        countdown.value = interval.value;
      } else {
        clearTimer();
        countdown.value = 0;
      }
    },
  );

  watch(
    () => interval.value,
    () => {
      if (isEnabled.value) {
        clearTimer();
        countdown.value = interval.value;
      }
    },
  );

  watch(
    [() => countdown.value, () => currentData.value, () => isEnabled.value],
    async () => {
      if (!isEnabled.value || !hasChanges.value) {
        clearTimer();
        return;
      }

      if (countdown.value > 0) {
        timer = window.setTimeout(() => {
          countdown.value--;
        }, 1000);
      } else if (countdown.value === 0) {
        await saveIfChanged();
        countdown.value = interval.value;
      }
    },
    { immediate: false },
  );

  return {
    isSaving: computed(() => isSaving.value),
    countdown: computed(() => countdown.value),
    lastSavedAt: computed(() => lastSavedAt.value),
    hasChanges: computed(() => hasChanges.value),
    cleanup: () => {
      clearTimer();
    },
  };
}
