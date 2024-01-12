import * as vscode from 'vscode';
import * as path from 'path';

interface Message {
    command: string;
    val: string | ArrayBuffer;
}

interface MapViewLoaderOptions {
    context: vscode.ExtensionContext,
    editor: vscode.TextEditor;
    filename: string;
    onDidExportAsSvg: (svgMarkup: string) => Promise<void>;
    onDidExportAsPng: (arrayBuffer: ArrayBuffer) => Promise<void>;
}

class MapViewLoader {
    private _extensionPath: string;
    private _editor: vscode.TextEditor;
    private _filename: string;
    private _onDidExportAsSvg: (svgMarkup: string) => void;
    private _onDidExportAsPng: (arrayBuffer: ArrayBuffer) => void;
    private _panel: vscode.WebviewPanel;

    constructor(options: MapViewLoaderOptions) {

        this._extensionPath = options.context.extensionPath;
        this._editor = options.editor;
        this._filename = options.filename;
        this._onDidExportAsSvg = options.onDidExportAsSvg;
        this._onDidExportAsPng = options.onDidExportAsPng;
        this._panel = vscode.window.createWebviewPanel(
            'mapView',
            `Map View (${options.filename})`,
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this._extensionPath, 'build')),
                ],
            }
        );

        this._panel.webview.html = this.getWebviewContent();
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: Message) => {
                const textEditor = this._editor;
                switch (message.command) {
                    case 'didExportAsSvg':
                        console.log(
                            '[MapViewLoader.js] onDidReceiveMessage::didExportAsSvg',
                            message
                        );
                        this._onDidExportAsSvg((message.val as string));
                        break;
                    case 'didExportAsPng':
                        console.log(
                            '[MapViewLoader.js] onDidReceiveMessage::didExportAsPng',
                            message
                        );
                        this._onDidExportAsPng((message.val as ArrayBuffer));
                        break;
                    case 'initialLoad':
                        console.log(
                            '[MapViewLoader.js] onDidReceiveMessage::initialLoad --',
                            textEditor.document.getText()
                        );
                        this.postMessage(textEditor.document.getText());
                        break;
                    case 'updateText':
                        var firstLine = textEditor.document.lineAt(0);
                        var lastLine = textEditor.document.lineAt(
                            textEditor.document.lineCount - 1
                        );
                        var textRange = new vscode.Range(
                            0,
                            firstLine.range.start.character,
                            textEditor.document.lineCount - 1,
                            lastLine.range.end.character
                        );

                        // Bring the document back into focus
                        vscode.window
                            .showTextDocument(
                                textEditor.document,
                                vscode.ViewColumn.One,
                                false
                            )
                            .then((editor) => {
                                editor.edit((editBuilder) => {
                                    editBuilder.replace(textRange, (message.val as string));
                                });
                            });
                        return;
                }
            },
            undefined,
            options.context.subscriptions
        );
    }

    dispose() {
        console.log('[MapViewLoader.js] dispose --', this._filename);
        this._panel.dispose();
    }

    postMessage(message: string, command: string = 'text') {
        console.log('[MapViewLoader.js] postMessage --', this._filename, message);
        this._panel.webview.postMessage({ command, val: message });
    }

    setActiveEditor(editor: vscode.TextEditor) {
        this._editor = editor;
    }

    reveal(viewSettings: vscode.ViewColumn | undefined) {
        this._panel.reveal(viewSettings);
    }

    private getNonce() {
        let text = '';
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private buildUri(p: string): vscode.Uri {
        const runtimePath = path.join(this._extensionPath, 'build', p);
        const runtimePathOnDisk = vscode.Uri.file(runtimePath);
        return this._panel.webview.asWebviewUri(runtimePathOnDisk);
    }

    private getWebviewContent(): string {
        const csp = this._panel.webview.cspSource;
        const p = path.join(this._extensionPath, 'build', 'asset-manifest.json');
        const manifest = require(p);
        const scripts = manifest.entrypoints;
        const styles = manifest.files['main.css'];

        const scriptsToInclude = scripts.map((p: string) => this.buildUri(p));
        const stylesToInclude = this.buildUri(styles);
        const nonce = this.getNonce();
        let scriptText = `<link rel="stylesheet" nonce="${nonce}" href="${stylesToInclude}">\n`;

        for (let index = 0; index < scriptsToInclude.length; index++) {
            let element = scriptsToInclude[index];

            if (element.toString().endsWith('.js')) {
                scriptText += `<script nonce="${nonce}" src="${element}"></script>\n`;
            }
        }
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <title>React App</title>
          <base href="${csp}">
        </head>
        <body>
          <div id="root"></div>
          ${scriptText}

          <script nonce="${nonce}">
            (function() {
                const vscode = acquireVsCodeApi();
                const textChangeBinding = (e) => {
					const message = e.data;
					switch (message.command) {
						case 'updateText':
							vscode.postMessage(message);
							break;
						case 'didExportAsSvg':
							vscode.postMessage(message);
							break;
						case 'didExportAsPng':
							vscode.postMessage(message);
							break;
					}
              	}
				window.addEventListener('message', (e) => textChangeBinding(e));
				window.addEventListener('load', (e) => vscode.postMessage({command:'initialLoad'}));
            }())
        </script>
        </body>
        </html>`;
    }
}

export default MapViewLoader;
