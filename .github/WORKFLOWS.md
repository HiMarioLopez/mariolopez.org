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
2. Sets up Node.js 20 and pnpm
3. Installs dependencies
4. Runs `pnpm check-links:prod` to check all links on https://mariolopez.org

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
2. Sets up pnpm and Node.js 20 (with pnpm cache)
3. Installs dependencies via `pnpm install --frozen-lockfile`
4. Executes `pnpm test:run` (Vitest run mode)

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
