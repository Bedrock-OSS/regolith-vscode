import { FileRename, RenameFilesParams, RenameParams } from "vscode-languageserver";
import { Manager } from "../../../manager/manager";

//Files created
export async function onDidRenameFilesAsync(params: RenameFilesParams): Promise<void> {
  return Promise.all(onDidRenameFiles(params)).then(() => {});
}

function onDidRenameFiles(params: RenameFilesParams): Promise<void>[] {
  const files = params.files;
  const promises: Promise<void>[] = [];

  for (let I = 0; I < files.length; I++) {
    promises.push(onDidRenameFile(files[I]));
  }

  return promises;
}

//Handles a file rename
async function onDidRenameFile(item: FileRename): Promise<void> {
  return;
}
