const ViewLoader = require('../../view/viewLoader');
const vscode = require('vscode');

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

function randomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

const errorOnRandomLine = (d, doc) => {
    const line = doc.lineAt(randomInt(doc.lineCount));
    const diag = new vscode.Diagnostic(line.range,"random error",vscode.DiagnosticSeverity.Error);
    //d.set(doc.uri,[diag])
};

function activate(context) {
	let panel;
	console.log('Congratulations, your extension "vscode-wardley-maps" is now active!');
	const config_errors = vscode.languages.createDiagnosticCollection();
	context.subscriptions.push(
        config_errors,
        vscode.workspace.onDidChangeTextDocument(x => {
			errorOnRandomLine(config_errors, x.document);
			if(panel !== undefined){
				panel.postMessage(x.document.getText());
			}
        })
    );
	
	context.subscriptions.push(vscode.commands.registerCommand('vscode-wardley-maps.helloWorld', function () {
		const editor = vscode.window.activeTextEditor;
		if(editor !== undefined){
			console.log("vscode-wardley-maps.helloWorld" + editor.document.fileName);
			panel = new ViewLoader(context, editor);
			panel.postMessage(editor.document.getText());
			panel.setActiveEditor(editor);
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(function (editor) {
		if(editor !== undefined){
			console.log("onDidChangeActiveTextEditor" + editor.document.fileName);
			panel.postMessage(editor.document.getText());
			panel.setActiveEditor(editor);
		}
	}));
	
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
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'wardleymap' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
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
	deactivate
}
