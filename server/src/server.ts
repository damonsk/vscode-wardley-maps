import { unwatchFile } from 'fs';
import { versions } from 'process';
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. 
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.wmLanguageServer || defaultSettings)
		);
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'wmLanguageServer'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	let settings = await getDocumentSettings(textDocument.uri);
	let text = textDocument.getText();
	let diagnostics: Diagnostic[] = [];
	let problems = 0;

	// Check for legacy market/ecosystem syntax and suggest modern decorator syntax
	const lines = text.split('\n');
	lines.forEach((line, lineIndex) => {
		const trimmedLine = line.trim();
		
		// Check for legacy market syntax
		if (trimmedLine.match(/^market\s+\w+\s*\[/)) {
			if (problems < settings.maxNumberOfProblems) {
				problems++;
				const marketMatch = trimmedLine.match(/^market\s+(\w+)\s*(\[.*\])/);
				if (marketMatch) {
					const componentName = marketMatch[1];
					const coordinates = marketMatch[2];
					
					let diagnostic: Diagnostic = {
						severity: DiagnosticSeverity.Information,
						range: {
							start: { line: lineIndex, character: 0 },
							end: { line: lineIndex, character: line.length }
						},
						message: `Consider using modern syntax: component ${componentName} ${coordinates} (market)`,
						source: 'wardley-maps'
					};
					diagnostics.push(diagnostic);
				}
			}
		}
		
		// Check for legacy ecosystem syntax  
		if (trimmedLine.match(/^ecosystem\s+\w+\s*\[/)) {
			if (problems < settings.maxNumberOfProblems) {
				problems++;
				const ecosystemMatch = trimmedLine.match(/^ecosystem\s+(\w+)\s*(\[.*\])/);
				if (ecosystemMatch) {
					const componentName = ecosystemMatch[1];
					const coordinates = ecosystemMatch[2];
					
					let diagnostic: Diagnostic = {
						severity: DiagnosticSeverity.Information,
						range: {
							start: { line: lineIndex, character: 0 },
							end: { line: lineIndex, character: line.length }
						},
						message: `Consider using modern syntax: component ${componentName} ${coordinates} (ecosystem)`,
						source: 'wardley-maps'
					};
					diagnostics.push(diagnostic);
				}
			}
		}

		// Validate decorator syntax
		if (trimmedLine.match(/^component\s+.*\(/)) {
			const decoratorMatch = trimmedLine.match(/\(([^)]+)\)/);
			if (decoratorMatch) {
				const decorators = decoratorMatch[1].split(',').map(d => d.trim());
				const validDecorators = ["build", "buy", "outsource", "market", "ecosystem", "inertia"];
				
				decorators.forEach(decorator => {
					if (!validDecorators.includes(decorator)) {
						if (problems < settings.maxNumberOfProblems) {
							problems++;
							let diagnostic: Diagnostic = {
								severity: DiagnosticSeverity.Warning,
								range: {
									start: { line: lineIndex, character: line.indexOf(decorator) },
									end: { line: lineIndex, character: line.indexOf(decorator) + decorator.length }
								},
								message: `Unknown decorator '${decorator}'. Valid decorators: ${validDecorators.join(', ')}`,
								source: 'wardley-maps'
							};
							diagnostics.push(diagnostic);
						}
					}
				});
			}
		}
	});

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Helper function to provide decorator descriptions
function getDecoratorDetail(decorator: string): string {
	const details: { [key: string]: string } = {
		"build": "Component is built in-house",
		"buy": "Component is purchased/acquired", 
		"outsource": "Component is outsourced to third party",
		"market": "Component represents a market",
		"ecosystem": "Component represents an ecosystem",
		"inertia": "Component has resistance to change"
	};
	return details[decorator] || "";
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {

		let d = documents.get(_textDocumentPosition.textDocument.uri);
		if (d === undefined) return [];

		const types: string[] = [
			"component",
			"submap",
			"pipeline",
			"pioneers",
			"settlers",
			"townplanners",
			"note",
			"annotation",
			"annotations",
			"x-axis",
			"y-axis",
			"style",
			"title",
			"anchor",
			// Legacy syntax - kept for backward compatibility
			"market",
			"ecosystem"
		]

		let rawVariables: string[] = [];
		let vars: CompletionItem[] = types.map((t) => {
			return {
				label: t,
				kind: CompletionItemKind.Function,
			}
		});

		const lines: string[] = d.getText().split('\n');
		const currentLine = lines[_textDocumentPosition.position.line].trim()


		const extractVariable = (s: string, line: string, toMutate: string[]) => {
			if (line.trim().indexOf(`${s} `) == 0) {
				// Handle both legacy syntax and new decorator syntax
				let componentName = line.split(`${s} `)[1].split('[')[0].trim();
				// Remove decorators if present (e.g., "Name (market, build)" -> "Name")
				if (componentName.indexOf('(') > -1) {
					componentName = componentName.split('(')[0].trim();
				}
				if (componentName && componentName.length > 0) {
					toMutate.push(componentName);
				}
			}
		}

		const willResultInVariable = ["component", "submap", "market", "anchor", "ecosystem"];

		lines.forEach(line =>
			willResultInVariable.forEach(start =>
				extractVariable(start, line, rawVariables)
			)
		)

		const variableCompletes: CompletionItem[] = rawVariables.map(v => { return { label: v, kind: CompletionItemKind.Variable } });


		if (_textDocumentPosition.position.character > 0) {
			console.log('_textDocumentPosition.position.character > 0');
			//exisitng content
			if (currentLine.indexOf('->') > -1 && currentLine.indexOf('->') === _textDocumentPosition.position.character - 2) {
				return variableCompletes;
			}

			if ((currentLine.indexOf('component ') > -1 || currentLine.indexOf('market ') > -1 || currentLine.indexOf('submap ') > -1)
				&& currentLine.indexOf('(') < _textDocumentPosition.position.character
				&& currentLine.indexOf(')') >= _textDocumentPosition.position.character) {
				
				// Modern decorator completion - support combinations
				const baseDecorators = ["build", "buy", "outsource", "market", "ecosystem", "inertia"];
				
				// Check what decorators are already present
				const decoratorSection = currentLine.substring(
					currentLine.indexOf('(') + 1, 
					currentLine.indexOf(')', currentLine.indexOf('('))
				);
				const existingDecorators = decoratorSection.split(',').map(d => d.trim()).filter(d => d.length > 0);
				
				// Filter out already used decorators to avoid duplicates
				const availableDecorators = baseDecorators.filter(decorator => 
					!existingDecorators.includes(decorator)
				);
				
				return availableDecorators.map(v => { 
					return { 
						label: v, 
						kind: CompletionItemKind.Keyword,
						detail: getDecoratorDetail(v)
					} 
				});
			}

			if (currentLine.trim().indexOf('style') === 0) {
				return ["plain", "colour", "wardley"].map(v => { return { label: v, kind: CompletionItemKind.Keyword } })
			}

			return vars.concat(variableCompletes);

		}
		else {
			console.log('_textDocumentPosition.position.character > 0');
		}




		console.log('default return');
		return vars.concat(variableCompletes);
	}
);

connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		return item;
	}
);

documents.listen(connection);

connection.listen();
