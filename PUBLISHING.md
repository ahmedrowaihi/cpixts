# Publishing

Releases go to npm via **OIDC trusted publishing** — GitHub Actions authenticates
with a short-lived OIDC token, so there is no `NPM_TOKEN` secret to manage, and
every release gets a signed provenance attestation automatically.

npm has no OIDC path for a package's *first* publish (a trusted publisher can
only be attached to a package that already exists). So there is a one-time
bootstrap; after that, releases are fully automated.

## One-time bootstrap

1. **Publish the initial version manually**, from your machine:

   ```bash
   npm login                    # browser + 2FA
   npm publish --no-provenance  # provenance can't be generated off-CI; opt out for this one publish
   ```

   `--no-provenance` is required here: `publishConfig.provenance` is `true` for
   CI, but provenance can only be produced by a supported CI provider (GitHub
   Actions) — a local publish would fail with `provider: null`. The package now
   exists on npm; every release after this goes through CI with provenance.

2. **Configure the trusted publisher** — either on npmjs.com or via the CLI.

   - Website: package **Settings → Trusted Publisher → GitHub Actions**, then set
     - Organization/user: `ahmedrowaihi`
     - Repository: `cpixts`
     - Workflow filename: `publish.yml`

   - CLI (npm `>=11.15.0`, account 2FA enabled):

     ```bash
     npm trust github cpixts \
       --file publish.yml \
       --repository ahmedrowaihi/cpixts \
       --allow-publish
     ```

## Every release after that (Changesets)

Releases are driven by [Changesets](https://github.com/changesets/changesets) —
no manual version bumps or `npm publish`.

1. **Add a changeset** with your change (or PR):

   ```bash
   npx changeset          # pick patch/minor/major + write a summary
   ```

   Commit the generated `.changeset/*.md` file alongside your code.

2. **Merge to `main`.** The [Release workflow](.github/workflows/publish.yml)
   collects pending changesets into a **"Version Packages"** PR that bumps the
   version and updates `CHANGELOG.md`.

3. **Merge the "Version Packages" PR.** That publishes to npm via OIDC (with
   provenance) and creates the matching GitHub Release automatically.

Infra/CI-only changes don't need a changeset (they don't affect the package).

## Requirements (handled by the workflow)

- npm CLI `>= 11.5.1` for OIDC publishing (the workflow upgrades npm; Node 22
  bundles an older one).
- Job permissions `contents: write`, `pull-requests: write`, `id-token: write`
  (already set).
- Repo setting **Settings → Actions → General → "Allow GitHub Actions to create
  and approve pull requests"** must be enabled so the workflow can open the
  Version Packages PR.
