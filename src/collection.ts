import * as vscode from "vscode";
import * as path from "path";

const options = require("./options.json");

// TODO
const data: any[] = [];
Object.keys(options).forEach((key) => {
  data.push({
    label: key,
    value: JSON.stringify(options[key], null, 2),
    collapsibleState: 0,
  });
});

export class NodeCollectionProvider implements vscode.TreeDataProvider<Node> {
  constructor() {}

  getTreeItem(element: Node): vscode.TreeItem {
    console.log("getTreeItem", element);
    return element;
  }

  getChildren(element?: Node): Thenable<Node[]> {
    return Promise.resolve(
      data.map(
        (item) => new Node(item.label, item.value, item.collapsibleState)
      )
    );
  }
}

class Node extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private value: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = new vscode.MarkdownString(
      "\n```json \n" + this.value + "\n```"
    );
    this.description = "123";
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "images",
        "light",
        "dependency.svg"
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "images",
        "dark",
        "dependency.svg"
      ),
    };
  }
}
