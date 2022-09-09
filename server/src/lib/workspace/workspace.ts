import { WorkspaceFolder } from "vscode-languageserver";
import { Manager } from "../manager/manager";

/**  */
export namespace Workspace {
  /**
   * Returns the workspace folders
   * @returns
   */
  export async function getWorkSpaces(): Promise<WorkspaceFolder[]> {
    const WS = Manager.connection.workspace.getWorkspaceFolders();

    WS.catch((err) => {
      console.error(`No workspaces folders received`);
    });

    return WS.then((ws) => (ws ? ws : []));
  }

  /**
   * The code executed when a workspace is removed
   * @param uri
   */
  export function removeWorkspace(uri: string): void {
    console.info("deleting workspace data: " + uri);
  }

  /**
   * Traverses the workspaces
   * @param folders The workspace folders to process */
  export async function traverseWorkspaces(folders: WorkspaceFolder[]): Promise<void> {
    return;
  }
}
