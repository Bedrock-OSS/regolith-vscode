import { DidChangeConfigurationNotification } from "vscode-languageserver";
import { Manager } from "../../manager/manager";

/**
 * Events that couldn't be configured. So we tell the client dynammlcally
 */
export function setDynamicEvents() {
  const client = Manager.connection.client;

  if (Manager.capabiltities.hasConfigurationCapability) {
    // Register for all configuration changes.
    client.register(DidChangeConfigurationNotification.type);
  }
}
