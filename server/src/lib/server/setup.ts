import { Connection, createConnection, ProposedFeatures } from "vscode-languageserver/node";
import { Manager } from "../manager/manager";
import { setEvents } from "./events/events";

import { onInitializeAsync } from "./initialize";
import { onInitializedAsync } from "./initialized";
import { onShutdownAsync } from "./shutdown";

export function setupServer() {
  // Create a connection for the server, using Node's IPC as a transport.
  // Also include all preview / proposed LSP features.

  let connection: Connection = createConnection(ProposedFeatures.all);
  Manager.connection = connection;

  console.log("starting regolith server");

  setEvents();

  // This handler provides diagnostics
  connection.onInitialized(onInitializedAsync);

  //Initialize
  connection.onInitialize(onInitializeAsync);

  //On shutdown
  connection.onShutdown(onShutdownAsync);

  //Initialize server
  Manager.documents.listen(connection);

  // Listen on the connection
  connection.listen();
}
