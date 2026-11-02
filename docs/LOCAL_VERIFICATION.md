# Local verification policy

The 67 historic GitHub Actions workflows were moved, unchanged, from
`.github/workflows/` to `.github/workflows-archive/` on 2026-10-30 to avoid
automatic GitHub Actions usage. The archived YAML files are reference material,
not active workflows. Restore one to `.github/workflows/` only when the
repository owner explicitly authorizes using GitHub Actions again.

Run the full verification on the developer's Windows machine, from a
clean checkout of the pull request's exact HEAD:

```powershell
npm.cmd ci --include=dev --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
npm.cmd run lint
if ($LASTEXITCODE -ne 0) { throw 'lint failed' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'build failed' }
npm.cmd exec -- vitest run --maxWorkers=1 --testTimeout=30000
if ($LASTEXITCODE -ne 0) { throw 'full regression failed' }
```

Record the tested commit SHA and logs. Do not merge application changes until
the full local check passes. Development commits and PR maintenance are managed
in `ysoktar/uduzgak`. The original `ROGOYATO/uduzgak` remains unchanged.
