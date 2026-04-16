# Change Log

All notable changes to the "ssh-envoy" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Fixed local VSIX install instructions to use the full extension identifier when uninstalling.
- Added a smoke test to verify deployment commands are registered on activation.
- Prevented activation from failing when duplicate copies of the extension are loaded in the same VS Code window.
- Added separate **SSH** and **Deployment** sections in the activity panel.
- Added deployment actions to execute `./vendor/bin/envoy run deploy --env=<environment>` directly.
- Added an inline action to paste the deployment command into the terminal without executing it.
