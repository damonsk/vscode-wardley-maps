const vscode = require('vscode');
const path = require('path');

class ViewLoader {
    constructor(fileUri, extensionPath) {
        this._extensionPath = extensionPath;
        console.log(extensionPath);
        this._panel = vscode.window.createWebviewPanel(
          "mapView",
          "Map View",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.file(path.join(this._extensionPath, 'build'))
            ]
          }
        );
    
        this._panel.webview.html = this.getWebviewContent(fileUri.fsPath);
      }

      getNonce = function() {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

      buildUri = function(p){
        const runtimePath = path.join(this._extensionPath, 'build', p);
        const runtimePathOnDisk = vscode.Uri.file(runtimePath);
        return runtimePathOnDisk.with({ scheme: 'vscode-resource' });
      }

      getWebviewContent = function(filepath) {
        const p = path.join(this._extensionPath, 'build', 'asset-manifest.json');
        const manifest = require(p);
        const scripts = manifest.entrypoints;

        let scriptsToInclude = scripts.map(p => this.buildUri(p));
		    const nonce = this.getNonce();


        //<link rel="stylesheet" type="text/css" href="${styleUri}">
		    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>React App</title>
				
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
        ${scriptsToInclude.map(s => `<script nonce="${nonce}" src="${s}"></script>`)}
        ${scriptsToInclude.map(s => `<p>${nonce} - ${s}</p>`)}
			</body>
			</html>`;
	}
}

module.exports = ViewLoader;