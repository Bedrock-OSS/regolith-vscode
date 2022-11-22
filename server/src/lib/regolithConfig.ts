import { TextDocument } from "vscode-languageserver-textdocument";
import * as JSONC from "jsonc-parser";


export class RegolithConfigDocument {

	public doc: TextDocument;
	public object: any;

	constructor(doc: TextDocument) {
		this.doc = doc;
		this.object = JSONC.parse(doc.getText());
	}

	public getRegolithProperty(): any {
		return this.object.regolith;
	}

	public isRegolithDocument(): boolean {
		return !!this.object.regolith;
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

}
