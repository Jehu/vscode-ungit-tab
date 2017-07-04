import * as VS from 'vscode';

export class UngitProvider implements VS.TextDocumentContentProvider {
  get onDidChange() {
    return new VS.EventEmitter<VS.Uri>().event;
  }

  provideTextDocumentContent() {
    return `
      <div style="position: fixed; height: 100%; width: 100%;">
        <iframe
          frameBorder="0"
          src="http://localhost:8448/?noheader=true#/repository?path=${VS.workspace.rootPath}"
          height="100%" width="100%"
        >
        </iframe>
      </div>
    `;
  }
}
