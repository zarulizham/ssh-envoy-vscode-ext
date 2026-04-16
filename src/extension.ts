import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ServerEntry {
	name: string;
	host: string;
}

type EnvoyItemKind = 'ssh' | 'deployment';

class EnvoyEnvironmentItem extends vscode.TreeItem {
	constructor(
		public readonly environmentName: string,
		public readonly host: string,
		private readonly kind: EnvoyItemKind,
	) {
		super(environmentName, vscode.TreeItemCollapsibleState.None);
		this.tooltip = host;
		this.description = host;
		if (kind === 'ssh') {
			this.contextValue = 'envoySshEnvironment';
			this.iconPath = new vscode.ThemeIcon('remote');
			this.command = {
				command: 'ssh-envoy.connect',
				title: 'Connect via SSH',
				arguments: [this],
			};
			return;
		}

		this.contextValue = 'envoyDeploymentEnvironment';
		this.iconPath = new vscode.ThemeIcon('rocket');
		this.command = {
			command: 'ssh-envoy.deploy.execute',
			title: 'Deploy Now',
			arguments: [this],
		};
	}
}

class EnvoyEnvironmentProvider implements vscode.TreeDataProvider<EnvoyEnvironmentItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<EnvoyEnvironmentItem | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(
		private readonly workspaceRoot: string | undefined,
		private readonly kind: EnvoyItemKind,
	) {}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: EnvoyEnvironmentItem): vscode.TreeItem {
		return element;
	}

	getChildren(): EnvoyEnvironmentItem[] {
		return getEnvoyServers(this.workspaceRoot).map(server => {
			return new EnvoyEnvironmentItem(server.name, server.host, this.kind);
		});
	}
}

function getEnvoyServers(workspaceRoot: string | undefined): ServerEntry[] {
	if (!workspaceRoot) {
		return [];
	}
	const envoyPath = path.join(workspaceRoot, 'Envoy.blade.php');
	if (!fs.existsSync(envoyPath)) {
		return [];
	}
	const content = fs.readFileSync(envoyPath, 'utf-8');
	return parseEnvoyServers(content);
}

function buildDeployCommand(item: EnvoyEnvironmentItem): string {
	return `./vendor/bin/envoy run deploy --env=${item.environmentName}`;
}

function createTerminal(workspaceRoot: string | undefined, name: string, iconId: string): vscode.Terminal {
	return vscode.window.createTerminal({
		name,
		cwd: workspaceRoot,
		iconPath: new vscode.ThemeIcon(iconId),
	});
}

function isAlreadyRegisteredError(error: unknown, kind: 'command' | 'view'): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	if (kind === 'command') {
		return /already exists/i.test(error.message);
	}

	return /Cannot register multiple views with same id/i.test(error.message);
}

function registerCommandSafely(
	command: string,
	handler: (...args: any[]) => unknown,
): vscode.Disposable | undefined {
	try {
		return vscode.commands.registerCommand(command, handler);
	} catch (error) {
		if (isAlreadyRegisteredError(error, 'command')) {
			return undefined;
		}

		throw error;
	}
}

function registerTreeDataProviderSafely(
	viewId: string,
	provider: vscode.TreeDataProvider<EnvoyEnvironmentItem>,
): vscode.Disposable | undefined {
	try {
		return vscode.window.registerTreeDataProvider(viewId, provider);
	} catch (error) {
		if (isAlreadyRegisteredError(error, 'view')) {
			return undefined;
		}

		throw error;
	}
}

function parseEnvoyServers(content: string): ServerEntry[] {
	const serversMatch = content.match(/@servers\s*\(\s*\[([^\]]*)\]\s*\)/);
	if (!serversMatch) {
		return [];
	}
	const arrayContent = serversMatch[1];
	const entries: ServerEntry[] = [];
	const pairRegex = /['"]([^'"]+)['"]\s*=>\s*['"]([^'"]+)['"]/g;
	let match;
	while ((match = pairRegex.exec(arrayContent)) !== null) {
		entries.push({ name: match[1], host: match[2] });
	}
	return entries;
}

export function activate(context: vscode.ExtensionContext) {
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	const sshProvider = new EnvoyEnvironmentProvider(workspaceRoot, 'ssh');
	const deploymentProvider = new EnvoyEnvironmentProvider(workspaceRoot, 'deployment');

	const sshTreeView = registerTreeDataProviderSafely('sshEnvoyServers', sshProvider);
	const deploymentTreeView = registerTreeDataProviderSafely('sshEnvoyDeployments', deploymentProvider);

	const connectCommand = registerCommandSafely('ssh-envoy.connect', (item: EnvoyEnvironmentItem) => {
		const terminal = createTerminal(workspaceRoot, `SSH: ${item.environmentName}`, 'remote');
		terminal.show();
		terminal.sendText(`ssh ${item.host}`);
	});

	const executeDeploymentCommand = registerCommandSafely('ssh-envoy.deploy.execute', (item: EnvoyEnvironmentItem) => {
		const terminal = createTerminal(workspaceRoot, `Deploy: ${item.environmentName}`, 'rocket');
		terminal.show();
		terminal.sendText(buildDeployCommand(item));
	});

	const pasteDeploymentCommand = registerCommandSafely('ssh-envoy.deploy.paste', (item: EnvoyEnvironmentItem) => {
		const terminal = createTerminal(workspaceRoot, `Deploy Draft: ${item.environmentName}`, 'edit');
		terminal.show();
		terminal.sendText(buildDeployCommand(item), false);
	});

	const refreshCommand = registerCommandSafely('ssh-envoy.refresh', () => {
		sshProvider.refresh();
		deploymentProvider.refresh();
	});

	if (workspaceRoot) {
		const watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(workspaceRoot, 'Envoy.blade.php')
		);
		watcher.onDidChange(() => {
			sshProvider.refresh();
			deploymentProvider.refresh();
		});
		watcher.onDidCreate(() => {
			sshProvider.refresh();
			deploymentProvider.refresh();
		});
		watcher.onDidDelete(() => {
			sshProvider.refresh();
			deploymentProvider.refresh();
		});
		context.subscriptions.push(watcher);
	}

	context.subscriptions.push(
		...(sshTreeView ? [sshTreeView] : []),
		...(deploymentTreeView ? [deploymentTreeView] : []),
		...(connectCommand ? [connectCommand] : []),
		...(executeDeploymentCommand ? [executeDeploymentCommand] : []),
		...(pasteDeploymentCommand ? [pasteDeploymentCommand] : []),
		...(refreshCommand ? [refreshCommand] : []),
	);
}

export function deactivate() {}
