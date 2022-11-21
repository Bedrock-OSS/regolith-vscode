import { CreateFilesParams, FileCreate } from "vscode-languageserver";

//Files created
export async function onDidCreateFilesAsync(params: CreateFilesParams): Promise<void> {
  return Promise.all(onDidCreateFiles(params)).then(() => {});
}

function onDidCreateFiles(params: CreateFilesParams): Promise<void>[] {
  const files = params.files;
  const promises: Promise<void>[] = [];

  for (let I = 0; I < files.length; I++) {
    promises.push(onDidCreateFile(files[I]));
  }

  return promises;
}

async function onDidCreateFile(item: FileCreate): Promise<void> {
  return;
}
