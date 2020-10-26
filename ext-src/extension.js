const ViewLoader = require('../view/viewLoader');
const vscode = require('vscode');

function randomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

const errorOnRandomLine = (d, doc) => {
    const line = doc.lineAt(randomInt(doc.lineCount));
    const diag = new vscode.Diagnostic(line.range,"random error",vscode.DiagnosticSeverity.Error);
    d.set(doc.uri,[diag])
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

	let disposable = vscode.commands.registerCommand('vscode-wardley-maps.helloWorld', function () {
		panel = new ViewLoader(context.extensionPath);
		vscode.window.showInformationMessage('Hello World from vscode-wardley-maps!');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
