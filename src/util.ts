"use strict";
const path = require("path");

import * as vscode from "vscode";
import { readFile } from "fs/promises";

export const readHtml = async (htmlPath: string, panel: vscode.WebviewPanel) =>
  (await readFile(htmlPath, "utf-8"))
    .replace(/%CSP_SOURCE%/gu, panel.webview.cspSource)
    .replace(
      /(src|href)="([^"]*)"/gu,
      (_, type, src) =>
        `${type}="${panel.webview.asWebviewUri(
          vscode.Uri.file(path.resolve(htmlPath, "..", src))
        )}"`
    );
