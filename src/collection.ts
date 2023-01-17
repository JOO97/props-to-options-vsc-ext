import * as vscode from "vscode";
import * as path from "path";

interface ICollection {
  name: string;
  value: object;
}
let collections: ICollection[] = [];

export class NodeCollectionProvider implements vscode.TreeDataProvider<Node> {
  private _onDidChangeTreeData = new vscode.EventEmitter<Node | void>();
  public readonly onDidChangeTreeData: vscode.Event<void | Node> =
    this._onDidChangeTreeData.event;

  constructor() {}

  getTreeItem(element: Node): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Node): Thenable<Node[]> {
    return Promise.resolve(
      element === undefined || (element && !element.children.length)
        ? collections.map((item) => new Node(item.name, item.value, 1))
        : element.children
    );
  }

  getParent(element: Node) {
    return null;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class Node extends vscode.TreeItem {
  children: Node[] = [];
  constructor(
    public readonly label: string,
    private value: object,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    const isChildNode = !collapsibleState;
    let { name, type } = (value as any) || {};
    name = name ? name : "";
    type = type ? type : "";
    super(label, collapsibleState);
    if (isChildNode) {
      this.iconPath = {
        light: path.join(
          __filename,
          "..",
          "..",
          "images",
          "light",
          "document.svg"
        ),
        dark: path.join(
          __filename,
          "..",
          "..",
          "images",
          "dark",
          "document.svg"
        ),
      };
      this.tooltip = new vscode.MarkdownString(
        "\n```json \n" +
          JSON.stringify(JSON.parse(this.label), null, 4) +
          "\n```"
      );
    }
    if (!isChildNode) {
      this.tooltip = new vscode.MarkdownString(
        "\n```json \n" + JSON.stringify(this.value, null, 4) + "\n```"
      );
      this.description = name;
      this.children = [new Node(JSON.stringify(this.value), name, 0)];
    }
  }
}

export class CollectionView {
  context: vscode.ExtensionContext;
  provider: NodeCollectionProvider | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.init();
  }

  async init() {
    collections = this.getCollections();
    this.registerCommand();

    this.provider = new NodeCollectionProvider();
    vscode.window.registerTreeDataProvider("collectionsView", this.provider);
  }

  registerCommand() {
    vscode.commands.registerCommand("props2options.editCollection", () =>
      this.runEditCollectionCommand()
    );
    vscode.commands.registerCommand("props2options.refreshCollection", () =>
      this.runRefreshCollectionCommand()
    );
  }

  async updateSetting() {
    await vscode.workspace
      .getConfiguration("props2options")
      .update("collections", collections, true);
    this.provider?.refresh();
  }

  private async runEditCollectionCommand() {
    await vscode.commands.executeCommand<vscode.Location[]>(
      "workbench.action.openSettings",
      "props2options.collections"
    );
  }

  private runRefreshCollectionCommand() {
    collections = this.getCollections();
    this.provider?.refresh();
  }

  private getCollections() {
    const { collections: data } =
      vscode.workspace.getConfiguration("props2options");
    vscode.commands.executeCommand(
      "setContext",
      "collectionsIsEmpty",
      !data || !data.length
    );
    return data || [];
  }
}
