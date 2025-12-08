# @codoodle-labs/legacy-grid

오래전에 만들다 중단했던 그리드 컴포넌트를 옮겨와, 설정만 손봐서 다시 돌릴 수 있는 상태로 복원했습니다. 이 코드베이스를 바탕으로 현대적인 형태로 재구현을 시도하려 합니다.

## 현재 상태
- Vite 기반 빌드/개발 환경 (vanilla TS)
- Vitest로 기존 Jest 스타일 테스트를 이식 완료
- `import.meta.env.DEV` 등 Vite 친화형 환경 변수 처리로 동작 확인

## 사용법
- 개발 서버: `pnpm -F @codoodle-labs/legacy-grid dev`
- 빌드: `pnpm -F @codoodle-labs/legacy-grid build`
- 테스트: `pnpm -F @codoodle-labs/legacy-grid test`

## 앞으로의 계획 메모
- 현대 브라우저/툴링에 맞는 구조 재설계 (상태, 렌더링, 접근성 개선)
- 기존 API 호환성을 유지하되 모듈식 확장성 확보
- 스타일 시스템 및 타입 안전성 강화

