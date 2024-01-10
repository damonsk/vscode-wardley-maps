const ViewLoader = require('../../view/viewLoader');
const vscode = require('vscode');
import * as wmlandscape from 'wmlandscape';
import * as path from 'path';
import { workspace } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient;

function activate(context) {
	let panelInstances = [];
	console.log(
		'Congratulations, your extension "' +
			context.extension.packageJSON.name +
			'" is now active!'
	);

	console.log('Version = ' + context.extension.packageJSON.version);
	const config_errors = vscode.languages.createDiagnosticCollection();
	context.subscriptions.push(
		config_errors,
		vscode.workspace.onDidChangeTextDocument((x) => {
			try {
				if (panelInstances[x.document.fileName] !== undefined) {
					console.log(
						'[[extension.ts::onDidChangeTextDocument]]',
						x.document.fileName
					);
					panelInstances[x.document.fileName].postMessage(x.document.getText());
				}
			} catch (e) {
				console.log('[[extension.ts::onDidChangeTextDocument::exception]]', e);
			}
		}),
		vscode.workspace.onDidCloseTextDocument((t) => {
			if (panelInstances[t.fileName] !== undefined) {
				console.log('[[extension.ts::onDidCloseTextDocument]]', t.fileName);
				panelInstances[t.fileName].dispose();
				panelInstances = panelInstances.filter((it) => {
					return it != t.fileName;
				});
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'vscode-wardley-maps.display-map',
			function () {
				const editor = vscode.window.activeTextEditor;
				if (editor !== undefined) {
					console.log(
						'[extension.ts] vscode-wardley-maps.display-map -- ' +
							editor.document.fileName
					);

					panelInstances[editor.document.fileName] = new ViewLoader(
						context,
						editor,
						editor.document.fileName
					);
					panelInstances[editor.document.fileName].setActiveEditor(editor);
				}
			}
		),
		vscode.commands.registerCommand(
			'vscode-wardley-maps.example-map',
			async function () {
				const document = await vscode.workspace.openTextDocument({
					language: 'wardleymap',
				});
				const editor = await vscode.window.showTextDocument(document);

				console.log(
					'[extension.ts] vscode-wardley-maps.example-map -- ' +
						editor.document.fileName
				);

				editor.edit((editBuilder) => {
					editBuilder.insert(
						new vscode.Position(0, 0),
						wmlandscape.Defaults.ExampleMap
					);
				});

				panelInstances[editor.document.fileName] = new ViewLoader(
					context,
					editor,
					editor.document.fileName
				);
				panelInstances[editor.document.fileName].setActiveEditor(editor);
			}
		)
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(function (editor) {
			try {
				if (
					editor !== undefined &&
					panelInstances[editor.document.fileName] !== undefined
				) {
					console.log(
						'[[extension.ts::onDidChangeActiveTextEditor]]',
						editor.document.fileName
					);
					panelInstances[editor.document.fileName].postMessage(
						editor.document.getText()
					);
					panelInstances[editor.document.fileName].setActiveEditor(editor);
				}
			} catch (e) {
				console.log(
					'[[extension.ts::onDidChangeActiveTextEditor::exception]]',
					e
				);
			}
		})
	);

	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions,
		},
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'wardleymap' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
		},
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

module.exports = {
	activate,
	deactivate,
};
