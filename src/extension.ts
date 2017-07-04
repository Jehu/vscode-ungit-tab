'use strict';

import * as VS from 'vscode';
import { either, test, identity } from 'ramda';
import { spawn } from 'child_process';
import { join } from 'path';
import { UngitProvider } from './UngitProvider';

let killUngitProcess;

const EXTENSION_TAB_NAME = 'Ungit';
const COMMAND_SHOW = 'extension.showUngit';
const VS_HTML_PREVIEW = 'vscode.previewHtml';
const UNGIT_URI = VS.Uri.parse('ungit-view://authority/ungit-view');

const showError = (message) => VS.window.showErrorMessage(message);

const isUngitStartMessage = either(
	test(/^## Ungit started ##$/gm),
	test(/^Ungit server already running$/gm),
);

const startUngit = (onUngitStart: Function) => {
	const ungitProcess = spawn('node', [
		join(__dirname, '../../node_modules/ungit/bin/ungit'),
		'--no-b',
		'--dev',
		'--maxNAutoRestartOnCrash=0'
	]);

  killUngitProcess = () => ungitProcess.kill();
  ungitProcess.stderr.on('data', showError);
	ungitProcess.stdout.on('data', (message) => {
		isUngitStartMessage(message) && onUngitStart();
	});
  ungitProcess.on('error', showError);
}

const showUngit = () => {
  return VS.commands.executeCommand(
		VS_HTML_PREVIEW,
		UNGIT_URI,
		VS.ViewColumn.One,
		EXTENSION_TAB_NAME,
	)
	.then(identity, showError);
};


export const activate = (context: VS.ExtensionContext) => {
  const status = VS.window.createStatusBarItem(VS.StatusBarAlignment.Right, 100);

	startUngit(() => {
		status.text = EXTENSION_TAB_NAME;
		status.command = COMMAND_SHOW;
		status.show();
		context.subscriptions.push(
			VS.workspace.registerTextDocumentContentProvider('ungit-view', new UngitProvider()),
			VS.commands.registerCommand(COMMAND_SHOW, showUngit),
		);
	});
}

export const deactivat = () => {
  killUngitProcess && killUngitProcess();
};
