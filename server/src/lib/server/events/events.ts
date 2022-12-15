import { onCodeActionAsync, onCodeActionResolveAsync } from '../../actions/Actions';
import { onCompletionRequestAsync, onCompletionResolveRequestAsync } from '../../completions/Completions';
import { Manager } from "../../manager/manager";
import { onDocumentChangedAsync } from "./documents";
import { onDidCreateFilesAsync } from "./workspace/create";
import { onDidDeleteFilesAsync } from "./workspace/delete";
import { onWorkspaceFolderChangeAsync } from "./workspace/folder";
import { onDidRenameFilesAsync } from "./workspace/rename";

/**
 * Setup the server events
 */
export function setEvents() {
  const { connection, documents } = Manager;

  //Provides diagnostics and such
  documents.onDidOpen(onDocumentChangedAsync);
  documents.onDidSave(onDocumentChangedAsync);

  // This handler provides commands
  // connection.onExecuteCommand(onCommandRequestAsync);

  // This handler provides code actions
  connection.onCodeAction(onCodeActionAsync);
  connection.onCodeActionResolve(onCodeActionResolveAsync);

  // This handler provides code lens
  // connection.onCodeLens(onCodeLensRequestAsync);
  // connection.onCodeLensResolve(onCodeLensResolveRequestAsync);

  // This handler provides completion items.
  connection.onCompletion(onCompletionRequestAsync);
  connection.onCompletionResolve(onCompletionResolveRequestAsync);
  // connection.onImplementation(onImplementationRequestAsync);

  // This handler provides go to definitions
  // connection.onDefinition(onDefinitionRequestAsync);
  // connection.onTypeDefinition(onTypeDefinitionRequestAsync);

  // This handler provides formatting
  // connection.onDocumentFormatting(onDocumentFormatRequestAsync);
  // connection.onDocumentRangeFormatting(onDocumentRangeFormatRequestAsync);

  // This handler provides document/workspace symbols
  // connection.onDocumentSymbol(onDocumentSymbolRequestAsync);
  // connection.onWorkspaceSymbol(onWorkspaceSymbolRequestAsync);

  // This handler provides support for when a configuration changes
  // connection.onDidChangeConfiguration(onDidChangeConfigurationAsync);

  // This handler provides hover support
  // connection.onHover(onHoverRequestAsync);

  // This handler provides references
  // connection.onReferences(onReferencesRequestAsync);

  // This handler provides signatures
  // connection.onSignatureHelp(onSignatureRequestAsync);

  //Settings changed
  // connection.onDidChangeConfiguration(onConfigurationChanged);

  // This handler provides semantic Tokens
  // connection.languages.semanticTokens.on(onProvideSemanticRequestAsync);
  // connection.languages.semanticTokens.onRange(onProvideRangeSemanticRequestAsync);

  if (Manager.capabilities.hasWorkspaceFolderCapability) {
    // Workspace event
    connection.workspace.onDidCreateFiles(onDidCreateFilesAsync);
    connection.workspace.onDidDeleteFiles(onDidDeleteFilesAsync);
    connection.workspace.onDidRenameFiles(onDidRenameFilesAsync);
    connection.workspace.onDidChangeWorkspaceFolders(onWorkspaceFolderChangeAsync);
  }
}
