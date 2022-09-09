import { WorkspaceFoldersChangeEvent } from "vscode-languageserver";
import { Workspace } from "../../../workspace/workspace";

export async function onWorkspaceFolderChangeAsync(params: WorkspaceFoldersChangeEvent): Promise<void> {
  return Promise.resolve(onWorkspaceFolderChange(params));
}

/**
 * Processes the remove and added workspaces
 * @param params
 */
function onWorkspaceFolderChange(params: WorkspaceFoldersChangeEvent): void {
  const removed = params.removed;

  for (let index = 0; index < removed.length; index++) {
    Workspace.removeWorkspace(removed[index].uri);
  }

  //Call to process workspaces
  Workspace.traverseWorkspaces(params.added);
}
