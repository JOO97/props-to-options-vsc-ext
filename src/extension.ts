// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const prettier = require("prettier");

import * as vscode from "vscode";
import { readHtml } from "./util";
import { DictionaryView } from "./dictionary";
import { CollectionView } from "./collection";

const { transform } = require("./tansform");

const createPanel = async (context: vscode.ExtensionContext) => {
  const panel = vscode.window.createWebviewPanel(
    "props2options",
    "Props to Options",
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(context.extensionPath)],
    }
  );
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    let content = "";
    editor.selections.forEach((selection) => {
      const range = new vscode.Range(selection.start, selection.end);
      const text = editor.document.getText(range) || "";
      content += text;
    });
    try {
      const reg =
        /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
      content = content.replace(reg, (word) => {
        return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
      });
      content = prettier.format(content, { tabWidth: 2, parser: "json" });
      console.log("c", JSON.parse(content));
      const res = transform(JSON.parse(content));
      panel.webview.postMessage({ type: "update", data: res });
    } catch (error) {
      console.log("content error", error);
      panel.webview.postMessage({
        type: "update",
        data: "转换错误, 选中的数据应为可转换为JSON的对象格式(可包含代码备注信息)",
      });
    }
  }

  //选中的内容复制到粘贴板
  //  await vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
  panel.webview.html = await readHtml(
    path.resolve(context.extensionPath, "webview/index.html"),
    panel
  );

  return panel;
};

const runTransformCommand = async (context: vscode.ExtensionContext) => {
  await createPanel(context);
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "props2options" is now active!');

  /* commands */
  vscode.commands.registerCommand("props2options.transform", () =>
    runTransformCommand(context)
  );

  //sidebar
  new CollectionView(context);
  new DictionaryView(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
