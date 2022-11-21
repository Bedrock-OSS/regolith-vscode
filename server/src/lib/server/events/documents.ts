import { TextDocumentChangeEvent } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

export async function onDocumentChangedAsync(event: TextDocumentChangeEvent<TextDocument>): Promise<void> {
  //Change on document happened
  console.log("Document changed");
  return;
}
