import * as vscode from 'vscode';
import * as wmlandscape from 'wmlandscape';
import * as path from 'path';
import { workspace } from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
} from 'vscode-languageclient/node';
import MapViewLoader from './MapViewLoader';
import { OwmApiResponse } from './OwmApiResponse';
import { MapView } from './MapView';

let client: LanguageClient;

function activate(context: vscode.ExtensionContext) {
	const getMapView = (name: string) => {
		return mapViews.find((instance) => instance.name == name)?.loader;
	};
	const saveFile = async (
		extension: string,
		data: Buffer,
		contentType: string = 'application/octet-stream'
	) => {
		console.log(`[extension.ts] onDidExportAs${extension.toUpperCase()} -- `);

		const options = {
			defaultUri: vscode.Uri.file(`untitled.${extension}`),
		};

		const saveUri = await vscode.window.showSaveDialog(options);

		if (saveUri) {
			const fs = require('fs');
			const path = saveUri.fsPath;

			const buffer =
				contentType === 'application/octet-stream' ? Buffer.from(data) : data;

			fs.writeFileSync(path, buffer);

			vscode.window.showInformationMessage(
				`Wardley Map ${extension.toUpperCase()} file saved to ${path}`
			);
		}
	};

	const onDidExportAsSvg = async (svgMarkup: Buffer) => {
		await saveFile('svg', svgMarkup);
	};

	const onDidExportAsPng = async (arrayBuffer: ArrayBuffer) => {
		await saveFile('png', Buffer.from(arrayBuffer), 'image/png');
	};

	let mapViews: MapView[] = [];

	console.log(context.extension.packageJSON.name + '" is now active!');
	console.log('Version = ' + context.extension.packageJSON.version);
	const config_errors = vscode.languages.createDiagnosticCollection();
	context.subscriptions.push(
		config_errors,
		vscode.workspace.onDidChangeTextDocument(
			(x: { document: { fileName: string; getText: () => any } }) => {
				const { document } = x;
				const { fileName } = document;
				try {

					console.log('[extension.ts] onDidChangeTextDocument --', fileName);
					const mv = getMapView(fileName);
					if (mv !== undefined) {
						mv.postMessage(document.getText());
					}
				} catch (e) {
					console.log(
						'[extension.ts] onDidChangeTextDocument::exception --',
						e
					);
				}
			}
		),
		vscode.workspace.onDidCloseTextDocument((t: { fileName: string }) => {
			const { fileName } = t;


			const mv = getMapView(fileName);
			if (mv !== undefined) {
				console.log('[extension.ts] -- [[onDidCloseTextDocument]]', fileName);
				mv.dispose();
				mapViews = mapViews.filter((item) => {
					return item.name != fileName;
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
					const fileName = editor.document.fileName;

					const mv = getMapView(fileName);
					if (mv !== undefined) {
						mv.reveal(vscode.ViewColumn.Beside);
					} else {
						console.log(
							'[extension.ts] vscode-wardley-maps.display-map -- ' + fileName
						);

						mapViews.push({
							name: fileName,
							loader: createView(
								context,
								editor,
								onDidExportAsSvg,
								onDidExportAsPng
							),
						});
						const mv = getMapView(fileName);
						if (mv !== undefined) {
							mv.setActiveEditor(editor);
						}
					}
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
				const { fileName } = editor.document;
				console.log(
					'[extension.ts] vscode-wardley-maps.example-map -- ' + fileName
				);

				editor.edit((editBuilder) => {
					editBuilder.insert(
						new vscode.Position(0, 0),
						wmlandscape.Defaults.ExampleMap
					);
				});

				mapViews.push({
					name: fileName,
					loader: createView(
						context,
						editor,
						onDidExportAsSvg,
						onDidExportAsPng
					),
				});
				const mv = getMapView(fileName);
				if (mv !== undefined) {
					mv.setActiveEditor(editor);
				}
			}
		),
		vscode.commands.registerCommand(
			'vscode-wardley-maps.export-map-svg',
			async function () {
				const editor = vscode.window.activeTextEditor;

				if (editor) {
					const { fileName } = editor.document;
					console.log('[extension.ts] vscode-wardley-maps.export-map-svg -- ' +
						editor.document.fileName
					);
					const mv = getMapView(fileName);
					if (mv !== undefined) {
						mv.postMessage('exportAsSvg', 'exportAsSvg');
					} else {
						vscode.window.showErrorMessage(
							'Please make sure Map View has been rendered (Wardley Maps: Display Map).'
						);
					}
				} else {
					vscode.window.showErrorMessage(
						'Please make sure Map Text document has focus.'
					);
				}
			}
		),
		vscode.commands.registerCommand(
			'vscode-wardley-maps.export-map-png',
			async function () {
				const editor = vscode.window.activeTextEditor;

				if (editor) {
					const { fileName } = editor.document;
					console.log(
						'[extension.ts] vscode-wardley-maps.export-map-png -- ' + fileName
					);

					const mv = getMapView(fileName);
					if (mv !== undefined) {
						mv.postMessage('exportAsPng', 'exportAsPng');
					} else {
						vscode.window.showErrorMessage(
							'Please make sure Map View has been rendered (Wardley Maps: Display Map).'
						);
					}
				} else {
					vscode.window.showErrorMessage(
						'Please make sure Map Text document has focus.'
					);
				}
			}
		),
		vscode.commands.registerCommand(
			'vscode-wardley-maps.export-to-owm',
			async function () {
				const editor = vscode.window.activeTextEditor;

				if (editor) {
					const { fileName } = editor.document;
					console.log(
						'[extension.ts] vscode-wardley-maps.export-to-owm -- ' +
						editor.document.fileName
					);
					const mapText =
						editor.document.getText() +
						'\n\n//Exported from vscode-wardley-maps';

					try {
						const response = await fetch(
							wmlandscape.Defaults.ApiEndpoint + 'save',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json; charset=utf-8',
								},
								body: JSON.stringify({
									id: '',
									text: mapText,
								}),
							}
						);

						const data = await response.json() as OwmApiResponse;

						// Show a VSCode info alert with the response data
						vscode.window.showInformationMessage(
							`Map exported successfully. URL: https://onlinewardleymaps.com/#${data.id}`
						);

						vscode.env.openExternal(vscode.Uri.parse(`https://onlinewardleymaps.com/#${data.id}`));

					} catch (error) {
						console.error('Error exporting to OWM:', error);
						vscode.window.showErrorMessage(
							'An error occurred while exporting to OWM.'
						);
					}
				} else {
					vscode.window.showErrorMessage(
						'Please make sure Map Text document has focus.'
					);
				}
			}
		),
		vscode.commands.registerCommand(
			'vscode-wardley-maps.generate-clone-url',
			async function () {
				const editor = vscode.window.activeTextEditor;

				if (editor) {
					const { fileName } = editor.document;
					console.log(
						'[extension.ts] vscode-wardley-maps.generate-clone-url -- ' +
						editor.document.fileName
					);
					const mapText =
						editor.document.getText() +
						'\n\n//Exported from vscode-wardley-maps';

					try {
						const response = await fetch(
							wmlandscape.Defaults.ApiEndpoint + 'save',
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json; charset=utf-8',
								},
								body: JSON.stringify({
									id: '',
									text: mapText,
								}),
							}
						);

						const data = await response.json() as OwmApiResponse;

						// Show a VSCode info alert with the response data
						vscode.window.showInformationMessage(
							`Map exported successfully. URL: https://onlinewardleymaps.com/#clone:${data.id}`
						);

						vscode.env.openExternal(vscode.Uri.parse(`https://onlinewardleymaps.com/#clone:${data.id}`));

					} catch (error) {
						console.error('Error exporting to OWM:', error);
						vscode.window.showErrorMessage(
							'An error occurred while exporting to OWM.'
						);
					}
				} else {
					vscode.window.showErrorMessage(
						'Please make sure Map Text document has focus.'
					);
				}
			}
		),
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(function (editor) {
			try {
				if (editor !== undefined) {
					const { fileName } = editor.document;
					console.log(
						'[extension.ts] onDidChangeActiveTextEditor --',
						fileName
					);
					const mapView = getMapView(fileName);
					if (mapView !== undefined) {
						mapView.postMessage(editor.document.getText());
						mapView.setActiveEditor(editor);
					}
				}
			} catch (e) {
				console.log(
					'[extension.ts] onDidChangeActiveTextEditor::exception --',
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

function createView(
	context: vscode.ExtensionContext,
	editor: any,
	onDidExportAsSvg: (svgMarkup: any) => Promise<void>,
	onDidExportAsPng: (arrayBuffer: any) => Promise<void>
): MapViewLoader {
	return new MapViewLoader({
		context,
		editor,
		filename: editor.document.fileName,
		onDidExportAsSvg,
		onDidExportAsPng,
	});
}

function deactivate() {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

export { activate, deactivate };