import { RegolithConfigDocument } from '../regolithConfig';
import DiagnosticsBuilder from './DiagnosticsBuilder';
import fs from 'fs';
import { CodeActionKind, DiagnosticSeverity } from 'vscode-languageserver';

export default function diagnoseRegolithConfig(doc: RegolithConfigDocument, diagnosticsBuilder: DiagnosticsBuilder) {
	if (doc.isRegolithDocument()) {
		checkPaths(doc, diagnosticsBuilder);
		checkFilterDefinitions(doc, diagnosticsBuilder);
		checkProfiles(doc, diagnosticsBuilder);
	}
}

function checkPaths(doc: RegolithConfigDocument, diagnosticsBuilder: DiagnosticsBuilder) {
	if (doc.object.packs) {
		if (doc.object.packs.behaviorPack) {
			let path = doc.object.packs.behaviorPack;
			if (typeof path !== "string") {
				diagnosticsBuilder.addDiagnosticForValue(["packs", "behaviorPack"], "Behavior pack path must be a string");
			} else {
				if (!fs.existsSync(doc.resolvePath(path))) {
					diagnosticsBuilder.addDiagnosticForValue(["packs", "behaviorPack"], "Behavior pack path does not exist");
				}
			}
		} else {
			diagnosticsBuilder.addDiagnosticForKey(["packs"], "The 'behaviorPack' property is missing");
		}
		if (doc.object.packs.resourcePack) {
			let path = doc.object.packs.resourcePack;
			if (typeof path !== "string") {
				diagnosticsBuilder.addDiagnosticForValue(["packs", "resourcePack"], "Resource pack path must be a string");
			} else {
				if (!fs.existsSync(doc.resolvePath(path))) {
					diagnosticsBuilder.addDiagnosticForValue(["packs", "resourcePack"], "Resource pack path does not exist");
				}
			}
		} else {
			diagnosticsBuilder.addDiagnosticForKey(["packs"], "The 'resourcePack' property is missing");
		}
	} else {
		diagnosticsBuilder.addDiagnosticForDocument("The 'packs' property is missing");
	}
	if (doc.object.regolith.dataPath) {
		let path = doc.object.regolith.dataPath;
		if (typeof path !== "string") {
			diagnosticsBuilder.addDiagnosticForValue(["regolith", "dataPath"], "Data path must be a string");
		} else {
			if (!fs.existsSync(doc.resolvePath(path))) {
				diagnosticsBuilder.addDiagnosticForValue(["packs", "dataPath"], "Data path does not exist");
			}
		}
	} else {
		diagnosticsBuilder.addDiagnosticForKey(["regolith"], "The 'dataPath' property is missing");
	}
}


function checkFilterDefinitions(doc: RegolithConfigDocument, diagnosticsBuilder: DiagnosticsBuilder) {
	if (doc.hasDefinitions()) {
		const filterDefinitions = doc.getFilterDefinitions();
		for (const filterDefinitionName in filterDefinitions) {
			const filterDefinition = filterDefinitions[filterDefinitionName];
			if (filterDefinition.url) {
				checkRemoteFilterDefinition(filterDefinitionName, doc, diagnosticsBuilder);
			}
		}
	}
}

function checkRemoteFilterDefinition(filterDefinitionName: string, doc:RegolithConfigDocument, diagnosticsBuilder: DiagnosticsBuilder) {
	const filterDefinition = doc.getFilterDefinitions()[filterDefinitionName];
	if (!filterDefinition.version) {
		diagnosticsBuilder.addDiagnosticForKey(["regolith", "filterDefinitions", filterDefinitionName], "The 'version' property is missing");
	} else {
		if (!fs.existsSync(doc.resolvePath(".regolith/cache/filters/" + filterDefinitionName + "/filter.json"))) {
			diagnosticsBuilder.addDiagnosticForKey(["regolith", "filterDefinitions", filterDefinitionName], "Filter " + filterDefinitionName + " not installed", DiagnosticSeverity.Warning,[
				{
					title: "Install all filters",
					kind: CodeActionKind.QuickFix,
					isPreferred: true,
					command: {
						title: "Install all filter",
						command: "regolith.install"
					}
				}
			]);
		} else {
			const filter = JSON.parse(fs.readFileSync(doc.resolvePath(".regolith/cache/filters/" + filterDefinitionName + "/filter.json"), "utf8"));
			// TODO: Add checking for newer latest/HEAD version and caching it
			if (filter.version !== filterDefinition.version && filterDefinition.version !== "latest" && filterDefinition.version !== "HEAD") {
				diagnosticsBuilder.addDiagnosticForValue(["regolith", "filterDefinitions", filterDefinitionName, "version"], "Filter " + filterDefinitionName + " is outdated", DiagnosticSeverity.Warning,[
					{
						title: "Install all filters",
						kind: CodeActionKind.QuickFix,
						isPreferred: true,
						command: {
							title: "Install all filters",
							command: "regolith.install"
						}
					}
				]);
			}
		}
	}
}

function checkProfiles(doc: RegolithConfigDocument, diagnosticsBuilder: DiagnosticsBuilder) {
	const profiles = doc.getProfiles();
	if (profiles) {
		for (const profileName in profiles) {
			if (Object.prototype.hasOwnProperty.call(profiles, profileName)) {
				const profile = profiles[profileName];
				if (profile.filters) {
					for (const filterIndex in profile.filters) {
						if (Object.prototype.hasOwnProperty.call(profile.filters, filterIndex)) {
							const filter = profile.filters[filterIndex];
							if (filter.filter && (!doc.hasDefinitions() || !doc.getFilterDefinitions()[filter.filter])) {
								diagnosticsBuilder.addDiagnosticForValue(["regolith", "profiles", profileName, "filters", +filterIndex, "filter"], "Filter " + filter.filter + " not found");
							} else if (filter.profile && !profiles[filter.profile]) {
								diagnosticsBuilder.addDiagnosticForValue(["regolith", "profiles", profileName, "filters", +filterIndex, "profile"], "Profile " + filter.profile + " not found");
							}
						}
					}
				} else {
					diagnosticsBuilder.addDiagnosticForKey(["regolith", "profiles", profileName], "Profile " + profileName + " has no filters");
				}
			}
		}
	} else {
		diagnosticsBuilder.addDiagnosticForKey(["regolith"], "No profiles found");
	}
}