# Scripts

## Link Checker

Automated link checking using [linkinator](https://github.com/JustinBeckwith/linkinator).

### Usage

```bash
# Check production site
pnpm check-links:prod

# Check local development server (must be running)
pnpm check-links:local

# Check a custom URL
pnpm check-links --url https://example.com
```

### Configuration

The link checker:

- ✅ Recursively checks all pages
- ✅ Skips `mailto:`, `#`, and `javascript:` links
- ✅ Retries failed links automatically
- ✅ Has a 10-second timeout per link
- ✅ Checks all links except the ones hosts refuse to serve to bots (see below)

### Integration

#### Pre-commit (Optional)

Link checking can be slow, so it's not included in the pre-commit hook by default. To add it:

```bash
# Add to .husky/pre-commit
pnpm check-links:local
```

#### CI/CD

**GitHub Actions** - Already configured! See `.github/workflows/check-links.yml`

The workflow:

- ✅ Runs daily at 2:00 AM UTC
- ✅ Runs on push to `main` branch
- ✅ Runs on pull requests
- ✅ Can be manually triggered

For other CI platforms:

```yaml
# Example GitHub Actions (if not using the existing workflow)
- name: Check links
  run: pnpm check-links:prod
```

### Allowed Failures

Some platforms (like LinkedIn) intentionally block automated link checkers and return status code `999`.  
These links are declared in `scripts/check-links.ts` under the `allowedFailures` array and are skipped during checks.

Current list:

- `https://www.linkedin.com/in/HiMarioLopez/`

To skip additional flaky links, add them to the `allowedFailures` array.
