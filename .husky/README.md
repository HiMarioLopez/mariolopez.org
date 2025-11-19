# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage git hooks.

## Hooks

### Pre-commit Hook
Runs unit tests before allowing a commit. If tests fail, the commit will be blocked.

### Commit-msg Hook
Validates commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Commit Message Format

Commit messages must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Revert a previous commit

### Examples

✅ **Valid:**
```
feat: add resume dropdown component
fix(resume): handle touch events on mobile
test: add unit tests for resume dropdown
docs: update README with testing instructions
```

❌ **Invalid:**
```
invalid commit message
Added new feature
fix: bug fix
```

### Skipping Hooks

If you need to skip hooks (not recommended), use:
```bash
git commit --no-verify
```

