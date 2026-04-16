# SSH Envoy

`ssh-envoy` is a VS Code extension that reads servers from your Laravel `Envoy.blade.php` file and lets you open SSH sessions directly from the Activity Bar.

## Features

- Adds an **SSH Envoy** view container to the Activity Bar.
- Parses `@servers([...])` entries from `Envoy.blade.php` in the workspace root.
- Displays each server as a tree item with host details.
- Connects with one click (or context action) using `ssh <host>` in a new integrated terminal.
- Refreshes automatically when `Envoy.blade.php` changes and supports manual refresh.

## Requirements

- A workspace containing `Envoy.blade.php` at the root.
- An `@servers` block using key/value pairs, for example:

```php
@servers(['web' => 'deploy@example.com', 'worker' => 'ubuntu@10.0.0.12'])
```

- SSH available in your shell environment.

## Usage

1. Open a project that contains `Envoy.blade.php`.
2. Open the **SSH Envoy** view from the Activity Bar.
3. Select a server to start an SSH terminal session.
4. Use the refresh action in the view title if needed.

## Commands

- `ssh-envoy.connect`: Connect via SSH for the selected server.
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
code --install-extension ssh-envoy-0.0.1.vsix
```

6. Reload VS Code when prompted, or run:

```bash
code --reuse-window .
```

Optional uninstall command:

```bash
code --uninstall-extension ssh-envoy
```

## Extension Settings

This extension currently does not contribute custom settings.

## Known Issues

- Only the first workspace folder is scanned in multi-root workspaces.
- Parsing expects `@servers([...])` in a straightforward key/value format.

## Release Notes

### 0.0.1

- Initial release with Envoy server discovery, tree view integration, refresh support, and one-click SSH connect.
