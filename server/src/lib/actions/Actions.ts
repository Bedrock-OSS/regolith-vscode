import { CodeAction, CodeActionParams } from 'vscode-languageserver/node';

export function onCodeActionAsync(event:CodeActionParams):CodeAction[] {
	if (event.context.diagnostics.length > 0) {
		return event.context.diagnostics.filter(d => d.data.length).flatMap(d => d.data);
	}
	return [];
}

export function onCodeActionResolveAsync(event:CodeAction):CodeAction {
	return event;
}