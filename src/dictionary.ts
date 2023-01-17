import * as vscode from "vscode";
import * as path from "path";

interface IDictionary {
  name: string;
  value: string;
}
let dictionary: IDictionary[] = [];

export const getDictionary = (): IDictionary[] => {
  const { dictionary: data } =
    vscode.workspace.getConfiguration("props2options");
  vscode.commands.executeCommand(
    "setContext",
    "dictionaryIsEmpty",
    !data || !data.length
  );
  return data || [];
};

export class NodeDictionaryProvider implements vscode.TreeDataProvider<Node> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Node | void>();
  public readonly onDidChangeTreeData: vscode.Event<void | Node> =
    this._onDidChangeTreeData.event;

  constructor() {}

  getTreeItem(element: Node): vscode.TreeItem {
    // console.log("getTreeItem2", element);
    return element;
  }

  getChildren(element?: Node): Thenable<Node[]> {
    return Promise.resolve(
      dictionary.map((item) => new Node(item.name, item.value, 0))
    );
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class Node extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private value: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.value = value;
    this.tooltip = `${label} - ${value}`;
    this.description = value;
    this.iconPath = {
      light: path.join(__filename, "..", "..", "images", "light", "string.svg"),
      dark: path.join(__filename, "..", "..", "images", "dark", "string.svg"),
    };
  }
}

export class DictionaryView {
  context: vscode.ExtensionContext;
  provider: NodeDictionaryProvider | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.init();
  }

  async init() {
    dictionary = getDictionary();

    this.registerCommand();

    this.provider = new NodeDictionaryProvider();
    vscode.window.registerTreeDataProvider("dictionaryView", this.provider);
    // this.context.subscriptions.push(provider);
  }

  registerCommand() {
    vscode.commands.registerCommand("props2options.addDictionary", () =>
      this.runAddDictionaryCommand()
    );
    vscode.commands.registerCommand("props2options.editDictionary", (node) => {
      this.runEditDictionaryCommand(node);
    });
    vscode.commands.registerCommand("props2options.delDictionary", (node) =>
      this.runDelDictionaryCommand(node)
    );

    vscode.commands.registerCommand("props2options.editAllDictionary", () =>
      this.runEditAllDictionaryCommand()
    );
    vscode.commands.registerCommand("props2options.refreshDictionary", () =>
      this.runRefreshDictionaryCommand()
    );
  }

  add(item: IDictionary) {
    let flag = true;
    dictionary.forEach(({ name }) => {
      if (flag && name === item.name) flag = false;
    });
    if (!flag) return vscode.window.showErrorMessage(`${item.name} is existed`);
    dictionary.push(item);
    this.updateSetting(dictionary);
  }

  edit(oldNode: IDictionary, newValue: string) {
    let i = -1;
    dictionary.forEach(({ name }, index) => {
      if (name === oldNode.name) return (i = index);
    });
    if (!dictionary[i])
      return vscode.window.showErrorMessage(`${oldNode.name} is not exist`);

    dictionary[i].value = newValue;
    this.updateSetting(dictionary);
  }

  del(node: IDictionary) {
    let i = -1;
    dictionary.forEach(({ name }, index) => {
      if (name === node.name) return (i = index);
    });
    if (!dictionary[i])
      return vscode.window.showErrorMessage(`${node.name} is not exist`);
    dictionary.splice(i, 1);

    this.updateSetting(dictionary);
  }

  async updateSetting(setting: IDictionary[], key = "dictionary") {
    const config = vscode.workspace.getConfiguration("props2options");
    await config.update("dictionary", dictionary, true);

    this.provider?.refresh();
  }

  private async runAddDictionaryCommand() {
    const name = (
      await vscode.window.showInputBox({
        prompt: "Enter the new word name",
        placeHolder: "word name",
        value: "\r\n",
        ignoreFocusOut: true,
      })
    )?.trim();
    if (!name) return;
    const value = (
      await vscode.window.showInputBox({
        prompt: "Enter the new word cn name",
        placeHolder: "word cn name",
        value: "\r\n",
        ignoreFocusOut: true,
      })
    )?.trim();
    if (!value) return;

    this.add({
      name,
      value,
    });
  }

  private async runEditDictionaryCommand(node: Node) {
    const value = (
      await vscode.window.showInputBox({
        prompt: "Enter the new word cn name",
        placeHolder: node.description as string,
        value: node.description as string,
        ignoreFocusOut: true,
      })
    )?.trim();
    if (!value) return;

    this.edit(
      {
        name: node.label,
        value: node.description as string,
      },
      value
    );
  }

  private runDelDictionaryCommand(node: Node) {
    this.del({
      name: node.label,
      value: node.description as string,
    });
  }

  private async runEditAllDictionaryCommand() {
    await vscode.commands.executeCommand<vscode.Location[]>(
      "workbench.action.openSettings",
      "props2options.dictionary"
    );

    // TODO: 打开settings.json并滚动到对应配置所在行
    // await vscode.commands.executeCommand<vscode.Location[]>(
    //   "workbench.action.search",
    //   { revealSetting: { key: "props2options.dictionary", edit: true } }
    // );
    // const position = await this.getPositionToReveal(
    //   "props2options.dictionary",
    //   edit,
    //   settingsModel,
    //   codeEditor
    // );
    // const doc = vscode.window.activeTextEditor?.document;
    // console.log("doc", doc);
    // _findAndSelect(vscode.window.activeTextEditor!, "props2options.dictionary");

    return;
    await vscode.commands.executeCommand<vscode.Location[]>(
      "workbench.action.gotoSymbol"
    );
  }

  private runRefreshDictionaryCommand() {
    dictionary = getDictionary();
    this.provider?.refresh();
  }
}

function _findAndSelect(editor: vscode.TextEditor, findValue: string) {
  let foundSelections: any[] = [];

  // get all the matches in the document
  let fullText = editor.document.getText();
  let matches = [...fullText.matchAll(new RegExp(findValue, "g"))];
  console.log(0, matches);

  matches.forEach((match: any, index) => {
    let startPos = editor.document.positionAt(match.index);
    let endPos = editor.document.positionAt(match.index + match[0].length);
    foundSelections[index] = new vscode.Selection(startPos, endPos);
  });
  console.log("foundSelections", foundSelections);
  editor.selections = foundSelections;
}
