import { cloneDeep, isEqual } from "lodash";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

export interface UseAutoSaveOptions<TData, TNormalized> {
  /**
   * 자동 저장 활성화 여부
   */
  enabled: boolean;
  /**
   * 원본 데이터
   */
  originData: TData | undefined;
  /**
   * 현재 데이터
   */
  currentData: TData | undefined;
  /**
   * 자동 저장 주기 (초)
   */
  interval: number;
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
  const timer = useRef<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<TData | undefined>(
    originData ? cloneDeep(originData) : undefined,
  );
  const [countdown, setCountdown] = useState<number | undefined>(interval);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const normalizedSaved = useMemo(
    () => (savedSnapshot ? normalizeForComparison(savedSnapshot) : undefined),
    [savedSnapshot, normalizeForComparison],
  );
  const normalizedCurrent = useMemo(
    () => (currentData ? normalizeForComparison(currentData) : undefined),
    [currentData, normalizeForComparison],
  );
  const hasChanges = useMemo(() => {
    if (!normalizedSaved || !normalizedCurrent) {
      return false;
    }
    return !isEqual(normalizedSaved, normalizedCurrent);
  }, [normalizedSaved, normalizedCurrent]);
  const isEnabled =
    enabled && originData !== undefined && currentData !== undefined;

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const saveIfChanged = useEffectEvent(async () => {
    if (!isEnabled || isSaving || !hasChanges) {
      return;
    }

    setIsSaving(true);
    try {
      await saveChanges(currentData!, normalizedCurrent!);
      setSavedSnapshot(cloneDeep(currentData));
      setLastSavedAt(new Date());
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSaving(false);
    }
  });

  useEffect(() => {
    setSavedSnapshot(originData ? cloneDeep(originData) : undefined);
  }, [originData]);

  useEffect(() => {
    if (isEnabled) {
      setCountdown(interval);
    } else {
      clearTimer();
      setCountdown(undefined);
    }
  }, [isEnabled, interval, currentData]);

  useEffect(() => {
    if (countdown === undefined || !hasChanges) {
      clearTimer();
      return;
    }

    if (countdown > 0) {
      timer.current = window.setTimeout(() => {
        setCountdown((prev) => (prev !== undefined ? prev - 1 : undefined));
      }, 1000);
    } else if (countdown === 0) {
      (async () => {
        await saveIfChanged();
        setCountdown(interval);
      })();
    }

    return () => clearTimer();
  }, [countdown, interval, hasChanges]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return {
    isSaving,
    hasChanges,
    lastSavedAt,
    countdown,
  };
}
