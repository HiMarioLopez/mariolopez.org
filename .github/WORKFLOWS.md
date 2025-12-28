# GitHub Actions Workflows

## Daily Check Links

**File:** `.github/workflows/daily-check-links.yml`

Automatically checks for broken links on the production site.

### Schedule

- Runs daily at 2:00 AM UTC
- Also runs on push to `main` branch
- Also runs on pull requests targeting `main`
- Can be manually triggered via GitHub Actions UI

### What it does

1. Checks out the code
2. Sets up Bun
3. Installs dependencies
4. Runs `bun run check-links:prod` to check all links on https://mariolopez.org

### Failure behavior

If broken links are found, the workflow will fail and you'll receive a notification. Check the workflow logs to see which links are broken.

### Customizing the schedule

To change when the daily check runs, edit the cron expression in `.github/workflows/daily-check-links.yml`:

```yaml
schedule:
  - cron: "0 2 * * *" # Format: minute hour day month day-of-week
```

Examples:

- `'0 2 * * *'` - Daily at 2:00 AM UTC
- `'0 9 * * 1'` - Every Monday at 9:00 AM UTC
- `'0 */6 * * *'` - Every 6 hours

[Cron expression generator](https://crontab.guru/)

## Daily Unit Tests

**File:** `.github/workflows/daily-tests.yml`

Automatically runs the Vitest unit test suite every day to catch regressions even when no code is pushed.

### Schedule

- Runs daily at 4:00 AM UTC
- Can be triggered manually via GitHub Actions UI (`workflow_dispatch`)

### What it does

1. Checks out the repository
2. Sets up Bun
3. Installs dependencies via `bun install --frozen-lockfile`
4. Executes `bun run test:run` (Vitest run mode)

### Customizing the schedule

Edit the cron expression in `.github/workflows/daily-tests.yml`:

```yaml
schedule:
  - cron: "0 4 * * *"
```

Examples:

- `'0 4 * * *'` - Daily at 4:00 AM UTC
- `'0 12 * * 1-5'` - Weekdays at 12:00 UTC
- `'0 */3 * * *'` - Every 3 hours

[Cron expression generator](https://crontab.guru/)

## Daily Code Audit

**File:** `.github/workflows/daily-code-audit.yml`

Uses GitHub Models (free AI inference) to perform automated code quality audits on the codebase.

### Schedule

- Runs daily at 3:00 AM UTC
- Can be triggered manually via GitHub Actions UI (`workflow_dispatch`)

### What it does

1. Checks out the repository
2. Sets up Bun and installs dependencies
3. Collects codebase context (package.json, config files, key components)
4. Sends code to GPT-4o-mini via GitHub Models for analysis
5. Creates or updates a GitHub Issue with findings

### Configuration

- **Model:** `openai/gpt-4o-mini` (free via GitHub Models)
- **Prompt:** `.github/audit_prompt.md` - customizable assessment criteria
- **Output:** GitHub Issue labeled `automated`, `code-quality`

### Customizing the audit

Edit `.github/audit_prompt.md` to adjust:

- Assessment categories and priorities
- Technology stack expectations
- Specific patterns to check for

### Customizing the schedule

Edit the cron expression in `.github/workflows/daily-code-audit.yml`:

```yaml
schedule:
  - cron: "0 3 * * *"
```

Examples:

- `'0 3 * * *'` - Daily at 3:00 AM UTC
- `'0 0 * * 0'` - Weekly on Sunday at midnight UTC
- `'0 3 * * 1'` - Weekly on Monday at 3:00 AM UTC

[Cron expression generator](https://crontab.guru/)
