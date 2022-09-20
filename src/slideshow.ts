// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from 'vscode';

enum SlideShowType {
	slide = 'slide',
	subslide = 'subslide',
	fragment = 'fragment',
	skip = 'skip',
	notes = 'notes',
	none = 'none'
}


export class CellSlideShowStatusBarProvider implements vscode.NotebookCellStatusBarItemProvider {
	provideCellStatusBarItems(cell: vscode.NotebookCell, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookCellStatusBarItem[]> {
		const items: vscode.NotebookCellStatusBarItem[] = [];
		const slideshow = cell.metadata.custom?.metadata?.slideshow ?? cell.metadata.metadata?.slideshow;

		if (slideshow?.slide_type) {
			items.push({
				text: `Slide Type: ${slideshow.slide_type}`,
				tooltip: `Slide Type: ${slideshow.slide_type}`,
				command: 'jupyter-tagging.switchSlideType',
				alignment: vscode.NotebookCellStatusBarAlignment.Right,
			});
		}

		return items;
	}
}

export function register(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.notebooks.registerNotebookCellStatusBarItemProvider('jupyter-notebook', new CellSlideShowStatusBarProvider()));

    context.subscriptions.push(vscode.commands.registerCommand('jupyter-tagging.switchSlideType', async (cell: vscode.NotebookCell) => {
		// create quick pick items for each slide type
		const items: vscode.QuickPickItem[] = [];
		for (const type in SlideShowType) {
			items.push({
				label: type
			});
		}

		// show quick pick
		const selected = await vscode.window.showQuickPick(items);
		// updat cell metadata with this slide type
		if (selected) {
			if (selected.label === SlideShowType.none) {
				// remove the slideshow metadata
				delete cell.metadata.custom?.metadata?.slideshow;
				delete cell.metadata.metadata?.slideshow;
			} else {
				if (cell.metadata.custom?.metadata) {
					// embedded in custom metadata
					cell.metadata.custom.metadata.slideshow = cell.metadata.custom.metadata.slideshow ?? {};
					cell.metadata.custom.metadata.slideshow.slide_type = selected.label;
				} else {
					cell.metadata.metadata.slideshow = cell.metadata.metadata.slideshow ?? {};
					cell.metadata.metadata.slideshow.slide_type = selected.label;
				}
			}

			// create workspace edit to update slideshow
			const edit = new vscode.WorkspaceEdit();
			const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
				...cell.metadata,
			});
			edit.set(cell.notebook.uri, [nbEdit]);
			await vscode.workspace.applyEdit(edit);
		}
	}));
}