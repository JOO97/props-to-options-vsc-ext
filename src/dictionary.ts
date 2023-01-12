import * as vscode from "vscode";
import * as path from "path";

const dictionary: any = {
  bg: "背景",
  background: "背景",
  text: "文本",
  animation: "动画",
  cursor: "鼠标样式",
  padding: "内边距",
  margin: "外边距",
  overflow: "溢出",
  hover: "鼠标经过样式",
  active: "激活样式",
  gradient: "渐变",
  shadow: "阴影",
  size: "大小",
  family: "字体",
  weight: "粗细",
  indent: "缩进",
  spacing: "文本间距",
  color: "颜色",
  border: "边框",
  radius: "圆角",
  type: "类型",
  column: "列",
};

// TODO
const data: any[] = [];
Object.keys(dictionary).forEach((key) => {
  data.push({
    label: key,
    value: dictionary[key],
    collapsibleState: 0,
  });
});

export class NodeDictionaryProvider implements vscode.TreeDataProvider<Node> {
  constructor() {}

  getTreeItem(element: Node): vscode.TreeItem {
    console.log("getTreeItem2", element);
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
    this.tooltip = `${label} - ${value}`;
    this.description = value;
    this.iconPath = {
      light: path.join(__filename, "..", "..", "images", "light", "string.svg"),
      dark: path.join(__filename, "..", "..", "images", "dark", "string.svg"),
    };
  }
}
