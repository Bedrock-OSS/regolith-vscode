import { DidChangeConfigurationParams } from "vscode-languageserver";
import { updateSettings } from "./settings/update";

export async function onDidChangeConfigurationAsync(params: DidChangeConfigurationParams): Promise<void> {
  return Promise.resolve(onDidChangeConfiguration(params));
}

export function onDidChangeConfiguration(params: DidChangeConfigurationParams): void {
  updateSettings();
}
