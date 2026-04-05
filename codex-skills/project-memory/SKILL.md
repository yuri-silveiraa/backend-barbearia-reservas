---
name: project-memory
description: Use when working in the `backend-barbearia-reservas` repository to persist decisions, recurring errors and fixes into the backend engineering memory so other agents can reuse the knowledge.
---

# Project Memory (backend)

## Canonical file

Update `ENGINEERING_MEMORY.md` at the root of this repository.

## When to use

Use this skill whenever you:

- fix bugs, certificate issues or recurring authentication/CSRF errors
- change use cases, DTOs, schemas or validation logic
- adjust repository contracts, database migrations or seed data
- record important test results or failed hypotheses worth remembering

## Entry format

```md
## YYYY-MM-DD - Short title

- Repo: `backend-barbearia-reservas`
- Contexto:
- Arquivos:
- Problema:
- Causa raiz:
- Solução:
- Validação:
- Pendências:
```

## Writing rules

- Be concise; cite files instead of duplicating code.
- Note the error messages and root cause when known.
- Mention failed attempts only if they prevent re-running the same guesswork.
- Update the entry in the same turn as the change whenever feasible.

## Scope

Keep this operational. Avoid turning it into a generic changelog; focus on repeated problems or future risks.
