/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as vscode from "vscode";
import { setupClient } from "./client/client";
import { Manager } from "./manager/manager";

export function activate(context: vscode.ExtensionContext): void {
  // activate(context);
  setupClient(context);
}

//shutdown server
export function deactivate(): Thenable<void> | undefined {
  console.log("stopping minecraft language client");

  if (!Manager.client) {
    return undefined;
  }

  return Manager.client.stop();
}
