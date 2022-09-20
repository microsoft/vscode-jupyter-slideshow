// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { register as registerSlideShow } from './slideShow';

export function activate(context: vscode.ExtensionContext) {
	registerSlideShow(context);
}

export function deactivate() {}
