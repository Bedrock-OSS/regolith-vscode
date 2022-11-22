import { TextDocumentChangeEvent } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import diagnoseRegolithConfig from '../../diagnostics/ConfigDiagnostics';
import { Diagnostic } from "../../diagnostics/Diagnostics";
import DiagnosticsBuilder from "../../diagnostics/DiagnosticsBuilder";
import { RegolithConfigDocument } from "../../regolithConfig";

export async function onDocumentChangedAsync(event: TextDocumentChangeEvent<TextDocument>): Promise<void> {
    console.log("document changed");
    let doc = new RegolithConfigDocument(event.document);
    if (doc.isRegolithDocument()) {
        let diagnosticsBuilder = new DiagnosticsBuilder(event.document);
        diagnoseRegolithConfig(doc, diagnosticsBuilder);
        diagnosticsBuilder.finish();
    } else {
        Diagnostic.resetDocument(event.document);
    }
    return;
}
