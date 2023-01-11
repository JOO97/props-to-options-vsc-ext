// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path = require("path");
const prettier = require("prettier");

import * as vscode from "vscode";
import { readHtml } from "./util";

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
      console.log("c", content);
      const res = transform(JSON.parse(content));
      panel.webview.postMessage({ type: "update", data: res });
    } catch (error) {
      console.log("content error");
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

const runCommand = async (context: vscode.ExtensionContext) => {
  console.log("getCommands", vscode.commands.getCommands());
  const panel = await createPanel(context);
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "props2options" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "props2options.transform",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      runCommand(context);
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
