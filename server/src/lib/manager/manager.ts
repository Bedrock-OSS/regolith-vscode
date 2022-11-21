import { Connection, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { ServerSettings } from "../server/settings/settings";
import { ExtensionCapabiltities } from "./capabilties";

export class Manager {
  /**The document manager that has possible cached documents, use GetDocument!*/
  public static documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  /**The possible capabiltities of the server*/
  public static capabiltities = new ExtensionCapabiltities();

  /**Server stuff*/
  public static connection: Connection;

  /**The settings of the plugin*/
  public static settings: ServerSettings = ServerSettings.createDefaulSettings();
}
