import { CompletionItem, CompletionItemKind, CompletionList, CompletionParams, MarkupContent } from 'vscode-languageserver/node';
import { getDocument } from '../server/events/documents';
import * as JSONC from "jsonc-parser";
import { RegolithConfigDocument } from '../regolithConfig';
import fs from 'fs';

const filterPath = ["regolith", "profiles", "*", "filters", "*", "filter"];
const profilePath = ["regolith", "profiles", "*", "filters", "*", "profile"];

export function onCompletionRequestAsync(event:CompletionParams):CompletionItem[] | CompletionList | undefined | null {
	let doc = getDocument(event.textDocument.uri);
	if (doc && doc.tree) {
		const location = JSONC.getLocation(doc.doc.getText(), doc.doc.offsetAt(event.position));
		if (location.matches(filterPath) && !location.isAtPropertyKey) {
			return Object.keys(doc.getFilterDefinitions()).map((key) => {
				return {
					label: key,
					kind: CompletionItemKind.Module,
					detail: key,
					insertText: key,
					data: {
						uri: event.textDocument.uri,
						type: "filter",
					},
				};
			});
		} else if (location.matches(profilePath) && !location.isAtPropertyKey) {
			return Object.keys(doc.getProfiles()).map((key) => {
				return {
					label: key,
					kind: CompletionItemKind.Module,
					detail: key,
					insertText: key,
					data: {
						uri: event.textDocument.uri,
						type: "profile",
					},
				};
			});
		}
	}
	return [];
}

export function onCompletionResolveRequestAsync(event:CompletionItem):CompletionItem {
	if (event.data && event.data.type === "filter") {
		event.documentation = getFilterDocumentation(event.label, getDocument(event.data.uri) as RegolithConfigDocument);
	}
	return event;
}

function getFilterDocumentation(filterName:string, doc:RegolithConfigDocument):MarkupContent | undefined {
	let filter = doc.getFilterDefinitions()[filterName];
	if (filter) {
		if (filter.runWith && !filter.url) {
			return {
				kind: "markdown",
				value: "Type: " + filter.runWith,
			};
		} else if (filter.url) {
			if (fs.existsSync(doc.resolvePath(".regolith/cache/filters/" + filterName))) {
				let completion = fs.readdirSync(doc.resolvePath(".regolith/cache/filters/" + filterName)).filter((file) => file.toLowerCase().endsWith("completion.md"));
				if (completion.length > 0) {
					return {
						kind: "markdown",
						value: fs.readFileSync(doc.resolvePath(".regolith/cache/filters/" + filterName + "/" + completion[0])).toString()
					};
				}
			}
			return {
				kind: "markdown",
				value: "Version: " + filter.version + "\n\nURL: " + filter.url,
			};
		}
	}
	return undefined;
}