import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('registers deployment commands after activation', async () => {
		const extension = vscode.extensions.getExtension('zarulizham.ssh-envoy');
		assert.ok(extension, 'Extension should be available in the test host');

		await extension?.activate();

		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('ssh-envoy.connect'));
		assert.ok(commands.includes('ssh-envoy.deploy.execute'));
		assert.ok(commands.includes('ssh-envoy.deploy.paste'));
		assert.ok(commands.includes('ssh-envoy.refresh'));
	});

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
