# TBD - To Be Done

## Current Build
- Next.js 14 app with Langbase RAG integration
- File upload → memory storage
- Query → AI response with source citations
- Clean dark UI with document sidebar

---

## Lacks & Issues

### High Priority

| # | Issue | Status |
|---|-------|--------|
| 1 | No chat history - every query is isolated; no conversation context | TBD |
| 2 | No streaming - users wait for full response; feels slow | TBD |
| 3 | No document deletion - uploaded files accumulate forever | TBD |
| 4 | No auth - anyone can upload/query your knowledge base | TBD |
| 5 | No Markdown rendering - responses rendered as plain text only | TBD |

### Medium Priority

| # | Issue | Status |
|---|-------|--------|
| 6 | No env validation - app fails silently if env vars missing | TBD |
| 7 | No error boundaries - one crash takes down entire UI | TBD |
| 8 | No document search/filter in sidebar | TBD |
| 9 | No loading skeleton for initial doc fetch | TBD |
| 10 | No API routes for programmatic access (only server actions) | TBD |

### Low Priority

| # | Issue | Status |
|---|-------|--------|
| 11 | No rate limiting on queries | TBD |
| 12 | No tests - `test` script is a placeholder | TBD |
| 13 | No multi-tenant support - single memory name for all users | TBD |

---

## Architecture Gaps

- No persistence layer for chat history (would need DB or Langbase memory sessions)
- Monolithic codebase - agents, actions, config all in main app

---

## Priority Order

1. **Streaming + Markdown** - Immediate UX improvement
2. **Chat History** - Core conversation context
3. **Doc Management** - Delete + search in sidebar
4. **Error Handling** - Env validation + error boundaries
5. **Auth** - If multi-user needed
6. **Tests** - Before adding more features