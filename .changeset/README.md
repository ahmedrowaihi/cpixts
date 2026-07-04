# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).
Each change that should affect a release adds a markdown file here describing the
bump (patch/minor/major) and a summary for the changelog.

```bash
npx changeset        # add a changeset (interactive)
```

On push to `main`, the release workflow collects pending changesets into a
"Version Packages" PR (which bumps the version and updates `CHANGELOG.md`).
Merging that PR publishes to npm via OIDC trusted publishing and creates the
matching GitHub Release.
