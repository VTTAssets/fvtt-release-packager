# FVTT Release Packager

Packages the content of your repository's default branch and uploads it to the triggering GitHub release. Additionally, it updates the `/module.json` manifest by setting or editing the following values:

- `.version`: version based on the release' tag_name, semver-cleaned (`v3.0.0` => `3.0.0`)
- `.manifest`: adjusted to reference the raw manifest file from the repositories default branch
- `.download`: adjusted to point to the created archive

All modules listed in the `.dependencies` array will be traversed and adjusted by setting or editing the following values:

- `.version`: version number found in the remote manifest
- `.download`: download link found in the remote manifest

## Warning

By automatically updating the version numbers of the dependencies, you change the environment your release is based on. A PR to make this behaviour configurable is welcome.

## Usage

1. Create a folder `.github/workflows` in your repository's root
2. Create YAML file with the folliing contents into this directory:

```
name: FVTT Release Packager
on:
  release:
    types: [released]

jobs:
  create-release-package:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: VTTAssets/fvtt-release-packager@v1.0.2
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

3. Push your changes to Github.

The action is run on every Github release (no pre-releases, no drafts). A installable Foundry VTT module archive will be generated and uploaded to the release, the `module.json` will be updated to point to this release asset as the new download.

You can now use the `.manifest` property in your `module.json` to publish your FVTT module to the module repository. The action will update this file to always point the download to the latest release.

Enjoy
