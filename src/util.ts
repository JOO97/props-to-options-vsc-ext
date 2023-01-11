'use strict';
const path = require('path')

import * as vscode from 'vscode';
import { readFile, writeFile } from 'fs/promises';

export const readHtml = async (htmlPath:string, panel:vscode.WebviewPanel) =>
  (await readFile(htmlPath, 'utf-8'))
    .replace(/%CSP_SOURCE%/gu, panel.webview.cspSource)
    .replace(
      /(src|href)="([^"]*)"/gu,
      (_, type, src) =>
        `${type}="${panel.webview.asWebviewUri(
          vscode.Uri.file(path.resolve(htmlPath, '..', src))
        )}"`
    );

 const getSettings = (group, keys) => {
  const settings = vscode.workspace.getConfiguration(group, null);
  const editor = vscode.window.activeTextEditor;
  const language = editor && editor.document && editor.document.languageId;
  const languageSettings =
    language && vscode.workspace.getConfiguration(null, null).get(`[${language}]`);
  return keys.reduce((acc, k) => {
    acc[k] = languageSettings && languageSettings[`${group}.${k}`];
    if (acc[k] == null) acc[k] = settings.get(k);
    return acc;
  }, {});
};


