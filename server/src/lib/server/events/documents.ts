import { TextDocumentChangeEvent } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Diagnostic } from '../../diagnostics/Diagnostics';
import { RegolithConfigDocument } from '../../regolithConfig';


export async function onDocumentChangedAsync(event: TextDocumentChangeEvent<TextDocument>): Promise<void> {
  console.log("document changed");
  // Parse the document both to object and to AST
  let doc = new RegolithConfigDocument(event.document);
  if (doc.isRegolithDocument()) {
    let diagnostics = doc.diagnose();
    Diagnostic.sendDiagnostics(event.document, diagnostics);
  } else {
    Diagnostic.resetDocument(event.document);
  }
  return;
}
