import { TextDocument } from "vscode-languageserver-textdocument";
import { Manager } from "../manager/manager";
import { Diagnostic as VSDiagnostics } from "vscode-languageserver/node";

/***/
export namespace Diagnostic {
  /**Sends the diagnostics to the client
   * @param doc The document to send diagnostics for
   * @param diagnostics The diagnostics to send
   */
  export function sendDiagnostics(doc: TextDocument, diagnostics: VSDiagnostics[]): void {
    Manager.connection.sendDiagnostics({ diagnostics: diagnostics, uri: doc.uri, version: doc.version });
  }

  /**
   * Clears the diagnostics to the client
   * @param doc The document to clear diagnostics for
   */
  export function resetDocument(doc: TextDocument | string): void {
    if (typeof doc === "string") {
      Manager.connection.sendDiagnostics({ diagnostics: [], uri: doc });
    } else {
      Manager.connection.sendDiagnostics({ diagnostics: [], uri: doc.uri, version: doc.version });
    }
  }
}
