// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const ViewLoader = require('../view/viewLoader');
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-wardley-maps" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-wardley-maps.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		let openDialogOptions = {
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
			filters: {
			  WardleyMap: ["wm"]
			}
		  };

		  vscode.window
			.showOpenDialog(openDialogOptions)
			.then(async (uri) => {
			if (uri && uri.length > 0) {
				vscode.window.showInformationMessage(uri[0].fsPath);
				new ViewLoader(uri[0], context.extensionPath);
			} else {
				vscode.window.showErrorMessage("No valid file selected!");
				return;
			}
			});		

		// Display a message box to the user
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
