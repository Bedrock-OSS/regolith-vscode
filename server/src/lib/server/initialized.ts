import { InitializedParams } from "vscode-languageserver";
import { traverse } from "../process/traverse";
import { setDynamicEvents } from "./events/dynamic";
import { updateSettings } from "./settings/update";

export async function onInitializedAsync(params: InitializedParams): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    onInitialized(params);
    resolve();
  });
}

function onInitialized(params: InitializedParams): void {
  console.log("Initialized regolith server");

  //Update the settings of the language server
  updateSettings();

  //Registers any follow ups
  setDynamicEvents();

  //For debug purposes use a higher delay version
  setTimeout(traverse, 0);
}
