# setup-git-chglog

<p align="left">
  <a href="https://github.com/Bpazy/setup-git-chglog/actions"><img alt="GitHub Actions status" src="https://github.com/Bpazy/setup-git-chglog/workflows/build-test/badge.svg"></a>
</p>

This action sets up a git-chglog environment for use in actions by:

- optionally downloading a version of git-chglog by version and adding to PATH

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@master
- uses: actions/setup-git-chglog@v1
  with:
    git-chglog-version: '0.15.0' # The git-chglog version to download (if necessary) and use.
- run: git-chglog --version
```

# Development

```
npm run build | npm run package
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
