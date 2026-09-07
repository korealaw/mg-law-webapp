# v8.4.1 recovery checkpoint

Baseline: `52fdf0bfde0034e1ba46573176c61907a8fb4e00`.

## Safety

- Production `main` is not modified during diagnosis.
- Backup branch: `backup/pre-recovery-20260908`.
- Preserve all survey responses, protected question-bank content, browser progress keys and existing deployment IDs.
- Never publish private Apps Script files or research responses to this repository.

## 2026-09-08 Apps Script editor evidence

User screenshots confirm the editor source currently contains the v8.4 backend source, not a v8.1 source tree:

- project title: `MG 새마을금고법 톡톡 · v8.4 백엔드`
- `BUILD_INFO.VERSION: '8.4'`
- `BUILD_INFO.BASE_REQUIRED: 100`
- `BUILD_INFO.MAX_CONTENT_BATCH: 20`
- protected `B001...` bank is present in `Code.gs`
- admin page identifies itself as the v8.4 automatic-opening monitor
- access registry name is `_WEBAPP_ACCESS_V84`

The screenshots also show `CONFIG.SPREADSHEET_ID` and `CONFIG.RESPONSE_SHEET_NAME` as empty strings. This is a configuration signal that must be checked against the source's fallback/setup behavior before editing; it is not yet classified as the root cause.

## Critical distinction

Editor HEAD being v8.4 does **not** prove that the deployed `/exec` Web App is serving v8.4. Apps Script deployments are versioned independently. The next mandatory checks are:

1. current deployment version / deployment ID / `/exec` URL,
2. `?action=health` response and version,
3. `setupProject()` result,
4. `_WEBAPP_ACCESS_V84` creation,
5. installed `onResearchFormSubmit` trigger,
6. actual Google Form submit -> `APPROVED`,
7. protected B001~B100 server return order,
8. mobile end-to-end flow.

## Public frontend findings

The current public v8.4 code has a resume-state defect in the free study flow: an answer is kept only in in-memory `state.study.answered/selected` while the rendered explanation is DOM-only. Navigating away after answering but before rating can return to a fresh-looking question while `answerStudy()` refuses another answer. v8.4.1 should persist and reconstruct the answered/explanation state or prevent that navigation state from becoming inconsistent.

No production-restoration claim is made until the deployed backend and end-to-end flow pass.
