import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient/node";
import * as path from "path";
import * as vscode from "vscode";
import { Manager } from "../manager/manager";
import TerminalWrapper from "./terminal";
import * as cp from 'child_process';
import {
    DebugSession,
    OutputEvent,
    TerminatedEvent
} from "@vscode/debugadapter";
import fs from "fs";
import * as JSONC from "jsonc-parser";

export function setupClient(context: vscode.ExtensionContext) {
    console.log("starting minecraft language client");

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));

    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions,
        },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [
            { scheme: "file", language: "json" },
            { scheme: "file", language: "jsonc" },
        ],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
        },
    };

    // Create the language client and start the client.
    Manager.client = new LanguageClient("languageRegolithServer", "LSP Regolith", serverOptions, clientOptions);

    // Start the client. This will also launch the server
    Manager.client.start();

    vscode.commands.executeCommand("setContext", "ext:is_active", true);

    // Register commands
    vscode.commands.registerCommand("regolith.init", () => {
        TerminalWrapper.runCommand("regolith", ["init"], (code: number) => {
            if (code === 0) {
                vscode.window.showInformationMessage("Regolith initialized successfully");
            } else {
                vscode.window.showErrorMessage("Regolith failed to initialize");
            }
        });
    });
    vscode.commands.registerCommand("regolith.install", () => {
        TerminalWrapper.runCommand("regolith", ["install-all"], (code: number) => {
            if (code === 0) {
                vscode.window.showInformationMessage("Regolith filters installed successfully");
                // TODO: Refresh somehow diagnostics
            } else {
                vscode.window.showErrorMessage("Regolith failed to install filters");
            }
        });
    });
    vscode.commands.registerCommand("regolith.run", (arg) => {
        TerminalWrapper.runCommand("regolith", ["run", arg ?? 'default'], (code: number) => {
            if (code === 0) {
                vscode.window.showInformationMessage("Regolith filters installed successfully");
                // TODO: Refresh somehow diagnostics
            } else {
                vscode.window.showErrorMessage("Regolith failed to install filters");
            }
        });
    });
    vscode.commands.registerCommand("regolith.install_single", () => {
        vscode.window.showInputBox({
            prompt: "Enter the name of the filter you want to install",
            placeHolder: "filter name",
        }).then((filterName) => {
            if (filterName) {
                TerminalWrapper.runCommand("regolith", ["install", filterName], (code: number) => {
                    if (code === 0) {
                        vscode.window.showInformationMessage("Regolith filter " + filterName + " installed successfully");
                    } else {
                        vscode.window.showErrorMessage("Regolith failed to install filter " + filterName);
                    }
                });
            }
        });
    });
    vscode.debug.registerDebugAdapterDescriptorFactory("regolith", {
        createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
            return new Promise((resolve, reject) => {
                let child: cp.ChildProcess;
                let opts: any = {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    env: {...process.env, FORCE_COLOR: '1'},
                };
                if (session.workspaceFolder) {
                    opts['cwd'] = session.workspaceFolder.uri.fsPath;
                }
                let dbgArgs = ['run', session.configuration.profile || 'default'];
                if (session.configuration.arguments) {
                    dbgArgs.push(...session.configuration.arguments);
                }
                child = cp.spawn('regolith', dbgArgs, opts);
                if (!child) {
                    reject(new Error("Could not start regolith"));
                } else {
                    const session = new DebugSession();
                    resolve(new vscode.DebugAdapterInlineImplementation(session));
                    child.stderr!.on('data', (buffer: Buffer) => {
                        let text = buffer.toString();
                        session.sendEvent(new OutputEvent(text, 'stderr'));
                    });
                    child.stdout!.on('data', (buffer: Buffer) => {
                        let text = buffer.toString();
                        session.sendEvent(new OutputEvent(text, 'stdout'));
                    });
                    child.on('exit', (code) => {
                        session.sendEvent(new OutputEvent(`Regolith exited with code ${code}`, 'console'));
                        session.sendEvent(new TerminatedEvent());
                    });
                }
            });
        }
    });
    const schemasDidChange = new vscode.EventEmitter<vscode.Uri>();
    let configWatcher: vscode.FileSystemWatcher | undefined;
    let filterCacheWatcher: vscode.FileSystemWatcher | undefined;
    vscode.workspace.registerTextDocumentContentProvider("regolith", {
        onDidChange: schemasDidChange.event,
        provideTextDocumentContent(uri: vscode.Uri): string {
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                return prepareSchema(context.asAbsolutePath('schemas/regolith-schema.json'), null);
            }
            const content = prepareSchema(context.asAbsolutePath('schemas/regolith-schema.json'), vscode.workspace.workspaceFolders[0].uri.fsPath);
            configWatcher?.dispose();
            configWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], 'config.json'), false, false, false);
            configWatcher.onDidChange(() => {
                schemasDidChange.fire(uri);
            });
            filterCacheWatcher?.dispose();
            filterCacheWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], '.regolith/cache/filters/*/*.*'), false, false, false);
            filterCacheWatcher.onDidChange((e) => {
                schemasDidChange.fire(uri);
            });
            filterCacheWatcher.onDidCreate((e) => {
                schemasDidChange.fire(uri);
            });
            filterCacheWatcher.onDidDelete((e) => {
                schemasDidChange.fire(uri);
            });
            return content;
        }
    });
}

function prepareSchema(schemaPath: string, workspaceFolder:string|null): string {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    if (!workspaceFolder) {
        return schema;
    }
    const schemaObj = JSON.parse(schema);
    if (fs.existsSync(path.join(workspaceFolder, 'config.json'))) {
        const config = JSONC.parse(fs.readFileSync(path.join(workspaceFolder, 'config.json'), 'utf8'));
        if (config && config.regolith && config.regolith.filterDefinitions) {
            const filters = Object.keys(config.regolith.filterDefinitions);
            for (const filter of filters) {
                const filterSchemaPath = path.join(workspaceFolder, '.regolith/cache/filters/' + filter + '/schema.json');
                if (config.regolith.filterDefinitions[filter].url) {
                    const option: any = {
                        properties: {
                            filter: {
                                const: filter
                            }
                        }
                    };
                    if (fs.existsSync(filterSchemaPath)) {
                        const filterSchema = JSON.parse(fs.readFileSync(filterSchemaPath, 'utf8'));
                        if (filterSchema) {
                            delete filterSchema.$schema;
                            delete filterSchema.$id;
                            option.properties.settings = filterSchema;
                        }
                    }
                    const completionMd = path.join(workspaceFolder, '.regolith/cache/filters/' + filter + '/completion.md');
                    if (fs.existsSync(completionMd)) {
                        option.properties.filter.markdownDescription = fs.readFileSync(completionMd, 'utf8');
                    } else {
                        option.properties.filter.markdownDescription = "Version: " + config.regolith.filterDefinitions[filter].version + "\n\nURL: " + config.regolith.filterDefinitions[filter].url;
                    }
                    schemaObj.definitions.profileFilter.anyOf.splice(0, 0, option);
                } else if (config.regolith.filterDefinitions[filter].runWith) {
                    const option: any = {
                        properties: {
                            filter: {
                                const: filter,
                                markdownDescription: "Type: " + config.regolith.filterDefinitions[filter].runWith
                            }
                        }
                    };
                    schemaObj.definitions.profileFilter.anyOf.splice(0, 0, option);
                }
            }
        }
    }
    return JSON.stringify(schemaObj, null, 2);
}