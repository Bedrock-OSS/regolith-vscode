import { TextDocument } from "vscode-languageserver-textdocument";
import * as JSONC from "jsonc-parser";
import { Diagnostic as VSDiagnostics } from "vscode-languageserver/node";
import { Manager } from './manager/manager';


/**
 * Converts an offset to a position containing line and character
 * @param text The text to parse
 * @param offset The offset to parse
 * @returns The position of the offset
 */
function offsetToPosition(text: string, offset: number): { line: number, character: number } {
    let line = 0;
    let character = 0;
    for (let i = 0; i < offset; i++) {
        if (text[i] === '\n') {
            line++;
            character = 0;
        } else {
            character++;
        }
    }
    return { line, character };
}

/**
 * Converts a JSONC path to a range containing the value of the path
 * @param path The path to the node
 * @param tree The tree to parse
 * @param text The text to parse
 * @returns The range of the node
 */
function valueRange(path: JSONC.JSONPath, tree:JSONC.Node|undefined, text: string): { start: { line: number, character: number }, end: { line: number, character: number } } {
	if (tree) {
		let node = JSONC.findNodeAtLocation(tree, path);
		if (node) {
			return {
				start: offsetToPosition(text, node.offset),
				end: offsetToPosition(text, node.offset + node.length)
			};
		}
	}
	return {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	};
}

/**
 * Converts a JSONC path to a range containing the name of the path (the key inside the object)
 * @param path The path to the node
 * @param tree The tree to parse
 * @param text The text to parse
 * @returns The range of the node
 */
function nameRange(path: JSONC.JSONPath, tree:JSONC.Node|undefined, text: string): { start: { line: number, character: number }, end: { line: number, character: number } } {
	if (tree) {
		let node = JSONC.findNodeAtLocation(tree, path);
		if (node) {
			node = node.parent?.children![0];
			if (node) {
				return {
					start: offsetToPosition(text, node.offset),
					end: offsetToPosition(text, node.offset + node.length)
				};
			}
		}
	}
	return {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	};
}

function createError(message: string, range: { start: { line: number, character: number }, end: { line: number, character: number } }): VSDiagnostics {
	return {
		severity: 1,
		range: range,
		message: message,
		source: "Regolith"
	};
}

export class RegolithConfigDocument {

	public doc: TextDocument;

	private object: any;

	private tree: JSONC.Node|undefined;

	constructor(doc: TextDocument) {
		this.doc = doc;
		this.object = JSONC.parse(doc.getText());
		this.tree = JSONC.parseTree(doc.getText());
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

	public diagnose(): VSDiagnostics[] {
		const diagnostics: VSDiagnostics[] = [];
		if (this.isRegolithDocument()) {
			this.checkPaths(diagnostics);
			this.checkFilterDefinitions(diagnostics);
			this.checkProfiles(diagnostics);
		}
		return diagnostics;
	}

	private checkFilterDefinitions(diagnostics: VSDiagnostics[]) {
		if (this.hasDefinitions()) {
			const filterDefinitions = this.getFilterDefinitions();
			for (const filterDefinitionName in filterDefinitions) {
				const filterDefinition = filterDefinitions[filterDefinitionName];
				if (filterDefinition.url) {
					if (!filterDefinition.version) {
						diagnostics.push(createError("The 'version' property is missing", nameRange(["regolith", "filterDefinitions", filterDefinitionName], this.tree, this.doc.getText())));
					} else {
						//TODO: Check if filter is installed. If not, provide code action to install it or install all filters
					}
				}
			}
		}
	}

	private checkPaths(diagnostics: VSDiagnostics[]) {
		if (this.object.packs) {
			if (this.object.packs.behaviorPack) {
				let path = this.object.packs.behaviorPack;
				if (typeof path !== "string") {
					diagnostics.push(createError("Behavior pack path must be a string", valueRange(["packs", "behaviorPack"], this.tree, this.doc.getText())));
				} else {
					//TODO: Check if path is valid
				}
			} else {
				diagnostics.push(createError("The 'behaviorPack' property is missing", nameRange(["packs"], this.tree, this.doc.getText())));
			}
			if (this.object.packs.resourcePack) {
				let path = this.object.packs.resourcePack;
				if (typeof path !== "string") {
					diagnostics.push(createError("Resource pack path must be a string", valueRange(["packs", "resourcePack"], this.tree, this.doc.getText())));
				} else {
					//TODO: Check if path is valid
				}
			} else {
				diagnostics.push(createError("The 'resourcePack' property is missing", nameRange(["packs"], this.tree, this.doc.getText())));
			}
		} else {
			diagnostics.push(createError("The 'packs' property is missing", {
				start: { line: 0, character: 0 },
				end: offsetToPosition(this.doc.getText(), this.doc.getText().length)
			}));
		}
		if (this.object.regolith.dataPath) {
			let path = this.object.regolith.dataPath;
			if (typeof path !== "string") {
				diagnostics.push(createError("Data path must be a string", valueRange(["regolith", "dataPath"], this.tree, this.doc.getText())));
			} else {
				//TODO: Check if path is valid
			}
		} else {
			diagnostics.push(createError("The 'dataPath' property is missing", nameRange(["regolith"], this.tree, this.doc.getText())));
		}
	}

	private checkProfiles(diagnostics: VSDiagnostics[]) {
		const profiles = this.getProfiles();
		if (profiles) {
			for (const profileName in profiles) {
				if (Object.prototype.hasOwnProperty.call(profiles, profileName)) {
					const profile = profiles[profileName];
					if (profile.filters) {
						for (const filterIndex in profile.filters) {
							if (Object.prototype.hasOwnProperty.call(profile.filters, filterIndex)) {
								const filter = profile.filters[filterIndex];
								if (filter.filter && (!this.hasDefinitions() || !this.getFilterDefinitions()[filter.filter])) {
									diagnostics.push(createError("Filter " + filter.filter + " not found", valueRange(["regolith", "profiles", profileName, "filters", +filterIndex, "filter"], this.tree, this.doc.getText())));
								} else if (filter.profile && !profiles[filter.profile]) {
									diagnostics.push(createError("Profile " + filter.profile + " not found", valueRange(["regolith", "profiles", profileName, "filters", +filterIndex, "profile"], this.tree, this.doc.getText())));
								}
							}
						}
					} else {
						diagnostics.push(createError("Profile " + profileName + " has no filters", nameRange(["regolith", "profiles", profileName], this.tree, this.doc.getText())));
					}
				}
			}
		} else {
			diagnostics.push(createError("No profiles found", nameRange(["regolith"], this.tree, this.doc.getText())));
		}
	}


}
