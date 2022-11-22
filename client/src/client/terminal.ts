import * as vscode from 'vscode';
import * as cp from 'child_process';
import { integer } from 'vscode-languageclient';
import chalk from 'chalk';
import * as util from "util";

export default class TerminalWrapper {
	private static _terminal: vscode.Terminal | null;
	private static _finished: boolean = false;

	public static runCommand(cmd: string, args: string[], onFinish: (status: integer) => void): void {
		try {
			//TODO: This works, but doesn't show ANSI colors. Need to figure out how to get that working.
			const writeEmitter = new vscode.EventEmitter<string>();
			let p: cp.ChildProcess;
			const pty: vscode.Pseudoterminal = {
				onDidWrite: writeEmitter.event,
				open: () => {
					const decoder = new util.TextDecoder('utf-8');
					writeEmitter.fire(chalk.bgWhite.black.bold(`Executing ${cmd} ${args.join(' ')}\r\n`));
					p = cp.spawn(cmd, args, vscode.workspace.workspaceFolders ? { cwd: vscode.workspace.workspaceFolders[0].uri.fsPath } : undefined);
					if (p && p.stderr && p.stdout) {
						p.stderr.on('data', (data: Buffer) => {
							writeEmitter.fire(decoder.decode(data).replace(/(\r)?\n/g, "\r\n"));
						});
						p.stdout.on('data', (data: Buffer) => {
							writeEmitter.fire(decoder.decode(data).replace(/(\r)?\n/g, "\r\n"));
						});
						p.on('exit', (code: number, signal: string) => {
							if (signal === 'SIGTERM') {
								writeEmitter.fire('\r\nSuccessfully killed process\r\n');
								writeEmitter.fire('\r\n');
							} else {
								writeEmitter.fire(`\r\nProcess ended with exit code ${code}\r\n`);
								writeEmitter.fire('\r\n');
							}
							this._finished = true;
							if (onFinish) {
								onFinish(code);
							}
						});
					}
				},
				close: () => { },
				handleInput: (char: string) => {
					if (char === '\x03') // Ctrl+C
						{p.kill('SIGTERM');}
				}
			};

			//TODO: Might break if multiple commands are run at the same time.
			if (this._terminal && this._finished) {
				this._terminal.dispose();
				this._terminal = null;
				this._finished = false;
			}

			this._terminal = vscode.window.createTerminal({
				name: 'Regolith',
				pty
			});
			this._terminal.show();
		} catch (error) {
			void vscode.window.showErrorMessage(`Error running external command: ${(error as any).message}`);
		}
	}

}