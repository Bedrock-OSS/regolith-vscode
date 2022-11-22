import { TextDocument } from "vscode-languageserver-textdocument";
import * as JSONC from "jsonc-parser";
import { Diagnostic as VSDiagnostics } from "vscode-languageserver/node";
import DiagnosticsBuilder from './diagnostics/DiagnosticsBuilder';


export class RegolithConfigDocument {

	public doc: TextDocument;
	private object: any;
	private diagnosticsBuilder: DiagnosticsBuilder;

	constructor(doc: TextDocument) {
		this.doc = doc;
		this.object = JSONC.parse(doc.getText());
		this.diagnosticsBuilder = new DiagnosticsBuilder(this.doc);
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

	public process() {
		if (this.isRegolithDocument()) {
			this.diagnose();
		}
	}

	public diagnose() {
		this.checkPaths();
		this.checkFilterDefinitions();
		this.checkProfiles();
		this.diagnosticsBuilder.finish();
	}

	private checkFilterDefinitions() {
		if (this.hasDefinitions()) {
			const filterDefinitions = this.getFilterDefinitions();
			for (const filterDefinitionName in filterDefinitions) {
				const filterDefinition = filterDefinitions[filterDefinitionName];
				if (filterDefinition.url) {
					if (!filterDefinition.version) {
						this.diagnosticsBuilder.addDiagnosticForKey(["regolith", "filterDefinitions", filterDefinitionName], "The 'version' property is missing");
					} else {
						//TODO: Check if filter is installed. If not, provide code action to install it or install all filters
					}
				}
			}
		}
	}

	private checkPaths() {
		if (this.object.packs) {
			if (this.object.packs.behaviorPack) {
				let path = this.object.packs.behaviorPack;
				if (typeof path !== "string") {
					this.diagnosticsBuilder.addDiagnosticForValue(["packs", "behaviorPack"], "Behavior pack path must be a string");
				} else {
					//TODO: Check if path is valid
				}
			} else {
				this.diagnosticsBuilder.addDiagnosticForKey(["packs"], "The 'behaviorPack' property is missing");
			}
			if (this.object.packs.resourcePack) {
				let path = this.object.packs.resourcePack;
				if (typeof path !== "string") {
					this.diagnosticsBuilder.addDiagnosticForValue(["packs", "resourcePack"], "Resource pack path must be a string");
				} else {
					//TODO: Check if path is valid
				}
			} else {
				this.diagnosticsBuilder.addDiagnosticForKey(["packs"], "The 'resourcePack' property is missing");
			}
		} else {
			this.diagnosticsBuilder.addDiagnosticForDocument("The 'packs' property is missing");
		}
		if (this.object.regolith.dataPath) {
			let path = this.object.regolith.dataPath;
			if (typeof path !== "string") {
				this.diagnosticsBuilder.addDiagnosticForValue(["regolith", "dataPath"], "Data path must be a string");
			} else {
				//TODO: Check if path is valid
			}
		} else {
			this.diagnosticsBuilder.addDiagnosticForKey(["regolith"], "The 'dataPath' property is missing");
		}
	}

	private checkProfiles() {
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
									this.diagnosticsBuilder.addDiagnosticForValue(["regolith", "profiles", profileName, "filters", +filterIndex, "filter"], "Filter " + filter.filter + " not found");
								} else if (filter.profile && !profiles[filter.profile]) {
									this.diagnosticsBuilder.addDiagnosticForValue(["regolith", "profiles", profileName, "filters", +filterIndex, "profile"], "Profile " + filter.profile + " not found");
								}
							}
						}
					} else {
						this.diagnosticsBuilder.addDiagnosticForKey(["regolith", "profiles", profileName], "Profile " + profileName + " has no filters");
					}
				}
			}
		} else {
			this.diagnosticsBuilder.addDiagnosticForKey(["regolith"], "No profiles found");
		}
	}


}
