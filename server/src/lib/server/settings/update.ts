import { DidChangeConfigurationParams } from "vscode-languageserver";
import { Manager } from "../../manager/manager";
import { ServerSettings } from "./settings";

export function onConfigurationChanged(params: DidChangeConfigurationParams): void {
  updateSettings();
}

export function updateSettings(): void {
  const settings = Manager.connection.workspace.getConfiguration("regolith");

  //If settings is nothing then skip it.
  if (settings === undefined || settings === null) {
    return;
  }

  settings.then(updateSettingsThen);
}

function updateSettingsThen(data: any): void {
  //If settings is nothing then skip it.
  if (data === undefined || data === null) {
    return;
  }

  const casted = <ServerSettings>data;

  if (ServerSettings.is(casted)) {
    Manager.settings = casted;
  }
}
