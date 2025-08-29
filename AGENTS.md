# General Behavior

Always responds in 日本語.

# Repository Guidelines

## Coding Style & Naming Conventions

- Use an auto-formatter: Prettier (JS/TS), Black (Python), gofmt (Go).
- Indentation: 2 spaces (web), 4 spaces (Python); no tabs.
- Naming: `kebab-case` for files/dirs (web), `snake_case` (Python), `CamelCase` for types/classes, `lowerCamelCase` for variables/functions.
- Keep modules small; one responsibility per file.

## Testing Guidelines

- Frameworks: Jest/Vitest (JS/TS), Pytest (Python), `go test` (Go).
- Test files: co-locate or in `tests/`; name `*.test.ts`, `test_*.py`, or `*_test.go`.
- Aim for ≥80% coverage on critical paths; prefer fast, deterministic tests.
- Run `make test` (or language equivalent) before pushing.

## Commit & Pull Request Guidelines

- Commits: Follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `docs:`). Keep messages imperative and scoped.
- PRs: Link issues, describe the change, note risks, and include screenshots or logs when relevant.
- Checks: PRs must pass CI (lint, build, test) and include any needed docs updates.

## Security & Configuration

- Never commit secrets. Use `.env.local` and provide `.env.example` with placeholders.
- Validate inputs at boundaries; prefer parameterized queries and prepared statements.
- Review third-party updates for security notes before bumping versions.
