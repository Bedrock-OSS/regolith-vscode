import { InitializeParams, InitializeResult, TextDocumentSyncKind } from "vscode-languageserver";
import { Manager } from "../manager/manager";

export async function onInitializeAsync(params: InitializeParams): Promise<InitializeResult> {
  return new Promise<InitializeResult>((resolve, reject) => {
    resolve(onInitialize(params));
  });
}

export function onInitialize(params: InitializeParams): InitializeResult {
  console.log("Initializing minecraft server");

  //process capabilities of the client
  const capabilities = params.capabilities;
  Manager.capabilities.parse(capabilities);

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,

      //Workspace settings
      workspace: {
        workspaceFolders: {
          changeNotifications: true,
          supported: true,
        },
        fileOperations: {
          didCreate: { filters: [{ scheme: "file", pattern: { glob: "**​/*.{mcfunction,json}" } }] },
          didDelete: { filters: [{ scheme: "file", pattern: { glob: "**​/*.{mcfunction,json}" } }] },
          didRename: { filters: [{ scheme: "file", pattern: { glob: "**​/*.{mcfunction,json}" } }] },
        },
      },
      codeActionProvider: true,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ["\""],
      },
    },
    serverInfo: {
      name: "regolith-language-server",
      version: require("../../../package.json").version,
    },
  };

  return result;
}
