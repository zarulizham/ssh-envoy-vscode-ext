# Laravel Envoy - SSH

`Laravel Envoy - SSH` is a VS Code extension that reads servers from your Laravel `Envoy.blade.php` file and lets you open SSH sessions or run deployment commands directly from the Activity Bar.

## Features

- Adds an **Laravel Envoy - SSH** view container to the Activity Bar.
- Parses `@servers([...])` entries from `Envoy.blade.php` in the workspace root.
- Splits the panel into **SSH** and **Deployment** sections.
- Displays each environment as a tree item with host details.
- Connects with one click (or inline action) using `ssh <host>` in a new integrated terminal.
- Runs `./vendor/bin/envoy run deploy --env=<environment>` directly from the Deployment section.
- Lets you paste the deployment command into a terminal without executing it, so you can edit it first.
- Refreshes automatically when `Envoy.blade.php` changes and supports manual refresh.

## Requirements

- A workspace containing `Envoy.blade.php` at the root.
- An `@servers` block using key/value pairs, for example:

```php
@servers(['web' => 'deploy@example.com', 'worker' => 'ubuntu@10.0.0.12'])
```

- SSH available in your shell environment.
- `./vendor/bin/envoy` available in the workspace if you want to use the Deployment section.

## Usage

1. Open a project that contains `Envoy.blade.php`.
2. Open the **Laravel Envoy - SSH** view from the Activity Bar.
3. In the **SSH** section, select an environment to start an SSH terminal session.
4. In the **Deployment** section, select an environment to run the deploy command immediately.
5. Use the inline rocket action to deploy immediately, or the inline edit action to paste the deploy command without running it.
6. Use the refresh action in either section if needed.

## Commands

- `ssh-envoy.connect`: Connect via SSH for the selected server.
- `ssh-envoy.deploy.execute`: Run the deployment command for the selected environment.
- `ssh-envoy.deploy.paste`: Paste the deployment command for the selected environment without executing it.
- `ssh-envoy.refresh`: Reload servers from `Envoy.blade.php`.

## Build And Install Locally (VSIX)

Follow these steps to generate the VSIX package yourself and install it in VS Code.

1. Open a terminal in this extension folder.
2. Install dependencies:

```bash
npm install
```

3. Package the extension (choose one):

```bash
npx @vscode/vsce package
```

or, if `vsce` is already installed globally:

```bash
vsce package
```

4. Confirm the generated file exists in the project root:

```bash
ls ssh-envoy-*.vsix
```

5. Install the VSIX into VS Code:

```bash
code --install-extension ./ssh-envoy-0.0.4.vsix
```

6. Reload VS Code when prompted, or run:

```bash
code --reuse-window .
```

Optional uninstall command:

```bash
code --uninstall-extension zarulizham.ssh-envoy
```

## Extension Settings

This extension currently does not contribute custom settings.

## Known Issues

- Only the first workspace folder is scanned in multi-root workspaces.
- Parsing expects `@servers([...])` in a straightforward key/value format.

## Release Notes

### 0.0.4

- Updated icon

### 0.0.3

- Updated package name

### 0.0.2

- Fixed local install instructions to use the current VSIX version and the full extension identifier.
- Added a smoke test that verifies deployment commands are registered after activation.
- Made activation resilient when a development copy and an installed copy of the extension are both loaded.

### 0.0.1

- Initial release with Envoy server discovery, tree view integration, refresh support, one-click SSH connect, and deployment actions.
