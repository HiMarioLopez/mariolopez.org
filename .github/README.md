# GitHub Actions Workflows

## Check Links

**File:** `.github/workflows/check-links.yml`

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

To change when the daily check runs, edit the cron expression in `.github/workflows/check-links.yml`:

```yaml
schedule:
  - cron: "0 2 * * *" # Format: minute hour day month day-of-week
```

Examples:

- `'0 2 * * *'` - Daily at 2:00 AM UTC
- `'0 9 * * 1'` - Every Monday at 9:00 AM UTC
- `'0 */6 * * *'` - Every 6 hours

[Cron expression generator](https://crontab.guru/)
