import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ServerEntry {
	name: string;
	host: string;
}

class EnvoyServerItem extends vscode.TreeItem {
	constructor(
		public readonly serverName: string,
		public readonly host: string,
	) {
		super(serverName, vscode.TreeItemCollapsibleState.None);
		this.tooltip = host;
		this.description = host;
		this.contextValue = 'envoyServer';
		this.iconPath = new vscode.ThemeIcon('remote');
		this.command = {
			command: 'ssh-envoy.connect',
			title: 'Connect via SSH',
			arguments: [this],
		};
	}
}

class EnvoyServerProvider implements vscode.TreeDataProvider<EnvoyServerItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<EnvoyServerItem | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private servers: ServerEntry[] = [];

	constructor(private workspaceRoot: string | undefined) {
		this.loadServers();
	}

	refresh(): void {
		this.loadServers();
		this._onDidChangeTreeData.fire();
	}

	private loadServers(): void {
		this.servers = [];
		if (!this.workspaceRoot) {
			return;
		}
		const envoyPath = path.join(this.workspaceRoot, 'Envoy.blade.php');
		if (!fs.existsSync(envoyPath)) {
			return;
		}
		const content = fs.readFileSync(envoyPath, 'utf-8');
		this.servers = parseEnvoyServers(content);
	}

	getTreeItem(element: EnvoyServerItem): vscode.TreeItem {
		return element;
	}

	getChildren(): EnvoyServerItem[] {
		return this.servers.map(s => new EnvoyServerItem(s.name, s.host));
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
	const provider = new EnvoyServerProvider(workspaceRoot);

	const treeView = vscode.window.createTreeView('sshEnvoyServers', {
		treeDataProvider: provider,
		showCollapseAll: false,
	});

	const connectCommand = vscode.commands.registerCommand('ssh-envoy.connect', (item: EnvoyServerItem) => {
		const terminal = vscode.window.createTerminal({
			name: `SSH: ${item.serverName}`,
			iconPath: new vscode.ThemeIcon('remote'),
		});
		terminal.show();
		terminal.sendText(`ssh ${item.host}`);
	});

	const refreshCommand = vscode.commands.registerCommand('ssh-envoy.refresh', () => {
		provider.refresh();
	});

	if (workspaceRoot) {
		const watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(workspaceRoot, 'Envoy.blade.php')
		);
		watcher.onDidChange(() => provider.refresh());
		watcher.onDidCreate(() => provider.refresh());
		watcher.onDidDelete(() => provider.refresh());
		context.subscriptions.push(watcher);
	}

	context.subscriptions.push(treeView, connectCommand, refreshCommand);
}

export function deactivate() {}
