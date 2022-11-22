import { Manager } from "../manager/manager";
import { Diagnostic as VSDiagnostics, DiagnosticSeverity } from "vscode-languageserver/node";
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
import * as JSONC from "jsonc-parser";

export default class DiagnosticsBuilder {
	private diagnostics: VSDiagnostics[] = [];
	private doc: TextDocument;
	private tree: JSONC.Node | undefined;

	constructor(doc: TextDocument) {
		this.doc = doc;
		this.tree = JSONC.parseTree(doc.getText());
	}

	public addDiagnosticForValue(path: JSONC.JSONPath, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error): void {
		const range = this.getValueRange(path);
		this.addDiagnostic(range, message, severity);
	}

	public addDiagnosticForKey(path: JSONC.JSONPath, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error): void {
		const range = this.getKeyRange(path);
		this.addDiagnostic(range, message, severity);
	}

	public addDiagnosticForDocument(message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error): void {
		const range = {
			start: { line: 0, character: 0 },
			end: this.doc.positionAt(this.doc.getText().length)
		};
		this.addDiagnostic(range, message, severity);
	}

	public addDiagnostic(range: Range, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error): void {
		this.diagnostics.push({
			severity: severity,
			range: range,
			message: message,
			source: "Regolith"
		});
	}

	public finish() {
		Manager.connection.sendDiagnostics({ uri: this.doc.uri, diagnostics: this.diagnostics });
	}

	private getValueRange(path: JSONC.JSONPath): Range {
		if (this.tree) {
			const node = JSONC.findNodeAtLocation(this.tree, path);
			if (node) {
				return {
					start: this.doc.positionAt(node.offset),
					end: this.doc.positionAt(node.offset + node.length)
				};
			}
		}
		return {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		};
	}

	private getKeyRange(path: JSONC.JSONPath): Range {
		if (this.tree) {
			let node = JSONC.findNodeAtLocation(this.tree, path);
			if (node) {
				node = node.parent?.children![0];
				if (node) {
					return {
						start: this.doc.positionAt(node.offset),
						end: this.doc.positionAt(node.offset + node.length)
					};
				}
			}
		}
		return {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		};
	}

}
