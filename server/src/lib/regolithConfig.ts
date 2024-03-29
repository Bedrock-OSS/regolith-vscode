import { TextDocument } from "vscode-languageserver-textdocument";
import * as JSONC from "jsonc-parser";
import path from 'path';


export class RegolithConfigDocument {

	public doc: TextDocument;
	public object: any;
	public tree: JSONC.Node | undefined;

	constructor(doc: TextDocument) {
		this.doc = doc;
		this.object = JSONC.parse(doc.getText());
		this.tree = JSONC.parseTree(doc.getText());
	}

	public getRegolithProperty(): any {
		return this.object.regolith;
	}

	public isRegolithDocument(): boolean {
		return !!this.object?.regolith;
	}

	public hasDefinitions(): boolean {
		return !!this.object.regolith.filterDefinitions;
	}

	public getProfiles(): any {
		return this.object.regolith.profiles;
	}

	public getProfile(profileName: string): any {
		return this.object.regolith.profiles[profileName];
	}

	public getFilterDefinitions(): any {
		return this.object.regolith.filterDefinitions;
	}

	public getFilePath(): string {
		return path.normalize(decodeURIComponent(this.doc.uri.replace("file:///", "")));
	}

	public resolvePath(to: string): string {
		return path.resolve(path.dirname(this.getFilePath()), to);
	}

}
