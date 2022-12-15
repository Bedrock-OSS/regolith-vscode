import { TextDocumentChangeEvent } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import diagnoseRegolithConfig from '../../diagnostics/ConfigDiagnostics';
import { Diagnostic } from "../../diagnostics/Diagnostics";
import DiagnosticsBuilder from "../../diagnostics/DiagnosticsBuilder";
import { RegolithConfigDocument } from "../../regolithConfig";

const documentMap = new Map<string, RegolithConfigDocument>();

export async function onDocumentChangedAsync(event: TextDocumentChangeEvent<TextDocument>): Promise<void> {
    console.log("document changed");
    let doc = new RegolithConfigDocument(event.document);
    if (doc.isRegolithDocument()) {
        documentMap.set(event.document.uri, doc);
        let diagnosticsBuilder = new DiagnosticsBuilder(doc);
        diagnoseRegolithConfig(doc, diagnosticsBuilder);
        diagnosticsBuilder.finish();
    } else {
        Diagnostic.resetDocument(event.document);
        documentMap.delete(event.document.uri);
    }
    return;
}

export function getDocument(uri:string): RegolithConfigDocument | undefined {
    return documentMap.get(uri);
}