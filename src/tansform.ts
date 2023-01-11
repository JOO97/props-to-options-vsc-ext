const options = require("./options.json");

interface IOption {
  name: string | number;
  value: string | number;
}

const isImage = (str: string): boolean => {
  const pattern =
    /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i;

  return pattern.test(str) || str.startsWith("//");
};

const isMarginOrPadding = (obj: object): boolean => {
  const keys = ["top", "bottom", "left", "right"];
  let flag = true;
  Object.keys(obj).forEach((key) => {
    if (flag && !keys.includes(key)) flag = false;
  });
  return flag;
};

const isAlign = (str: string): boolean => {
  const pos = ["left", "center", "right"];
  return pos.includes(str);
};

const isFloat = (num: any): boolean => {
  return num != parseInt(num);
};

const generateOptions = (props: object) => {
  const mapObject = (source: any) => {
    let r: any = {};
    // TODO 数据合法性校验
    // if (source instanceof Array) source = source[0];
    Object.keys(source).forEach((key) => {
      const keyName = key;
      const value = source[key];
      const valueType = typeof value;
      if (valueType === "object") {
        let r2;
        // array
        if (value instanceof Array) {
          console.log("arr", value, value[0]);
          if (!value.length) return;
          r2 = {
            name: key,
            type: "tabs",
            fold: false,
            default: value,
            template: {
              name: `${key}<%=i+1%>`,
              children: mapObject(value[0]),
            },
          };
        } else {
          // object
          const keys = Object.keys(value);
          if (keys.includes("type")) {
            // 包含type
            const typeOptions: IOption[] = [];
            const tmpResult: any = {};
            keys.forEach((key2) => {
              if (key2 === "type") {
              } else if (key2 === "show") {
                tmpResult["show"] = mapObject({ show: value[key2] });
              } else {
                typeOptions.push({
                  name: key2,
                  value: key2,
                });
              }
            });
            tmpResult["type"] = {
              name: "类型",
              type: "select",
              options: typeOptions,
              default: value["type"],
            };
            typeOptions.forEach((item) => {
              tmpResult[item.name] = {
                name: item.name,
                type: "group",
                children: mapObject(value[item.name]),
                showInPanel: {
                  conditions: [[".type", "$eq", item.name]],
                },
              };
            });

            r2 = {
              name: keyName,
              type: "group",
              fold: false,
              children: tmpResult,
            };
          } else if (isMarginOrPadding(value)) {
            // margin/padding
            r2 = Object.assign({}, options["padding"], {
              default: {
                top: value["top"],
                bottom: value["bottom"],
                left: value["left"],
                right: value["right"],
              },
            });
          } else if (key === "decoration") {
            // decoration
            r2 = Object.assign(
              {
                style: {
                  default: value["style"],
                },
                color: {
                  default: value["color"],
                },
                line: {
                  default: value["line"],
                },
              },
              options["decoration"]
            );
          } else {
            const children = mapObject(value);
            if (!Object.keys(children).length) return;
            r2 = {
              name: keyName,
              type: "group",
              fold: true,
              children,
            };
          }
        }
        r[key] = r2;
      } else if (valueType === "boolean") {
        r[key] = {
          type: "switch",
          name: keyName,
          default: value,
        };
      } else if (valueType === "number") {
        r[key] = {
          type: "number",
          name: keyName,
          default: value,
          step: isFloat(value) ? 0.5 : 1,
          min: 0,
          max: 100,
        };
      } else if (valueType === "string") {
        // 颜色
        if (value.startsWith("#") || value.startsWith("rgb")) {
          r[key] = {
            name: keyName,
            type: "color",
            default: value,
          };
        } else if (
          value.startsWith("url") ||
          value.startsWith("data:image") ||
          isImage(value)
        ) {
          // 图片 地址
          r[key] = {
            name: keyName,
            type: "image",
            default: value,
          };
        } else {
          if (key === "cursor") r[key] = options["cursor"]; //鼠标
          else if (key.indexOf("family") !== -1)
            r[key] = options["family"]; //字体
          else if (key === "weight") r[key] = options["weight"];
          else if (isAlign(value))
            r[key] = Object.assign({}, options["align"], { default: value });
          else
            r[key] = {
              name: key,
              type: "select",
              options: [
                {
                  name: value,
                  value: value,
                },
              ],
              default: value,
            };
        }
      }
      // r[key] = value;
    });
    return r;
  };
  return mapObject(props);
};

export const transform = (props: object) => {
  const o = generateOptions(props);
  // await fs.writeFile(
  //   path.resolve(__dirname, "result.json"),
  //   JSON.stringify(o, null, 4)
  // );
  return JSON.stringify(o, null, 4);
};
