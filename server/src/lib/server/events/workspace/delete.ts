import { DeleteFilesParams, FileDelete } from "vscode-languageserver";

//Files created
export async function onDidDeleteFilesAsync(params: DeleteFilesParams): Promise<void> {
  return Promise.resolve(onDidDeleteFiles(params)).then(() => {});
}

function onDidDeleteFiles(params: DeleteFilesParams): Promise<void>[] {
  const files = params.files;
  const promises: Promise<void>[] = [];

  for (let I = 0; I < files.length; I++) {
    promises.push(onDidDeleteFile(files[I]));
  }

  return promises;
}

async function onDidDeleteFile(item: FileDelete): Promise<void> {
  return;
}
