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

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
