# EgretAutoCodeEui

[github地址](https://github.com/chengyoujie/egretautocodeeui)

根据当前编辑器中的exml 文件生成一键生成代码。 

操作步骤：打开Exml 文件 按下`F12`会自动生成
![AutoCodeEui自动生成](https://img-blog.csdnimg.cn/20201107162857979.gif)

注： 生成代码的格式可以在`项目/src/template/autocode`目录下修改


## 使用说明：

1.在编辑器中打开当前需要导出的exml文件。

2.按下快捷键`F12` 导出代码文件。(或者使用快捷键 `ctr+shift+p` 打开输入框中输入    `>Egret AutoCode Exml生成代码` 按下回车即可 )

或者可以 通过  ctrl+F12  监听文件变化自动生成

注：
如果非egret 项目， 也可以使用F12 执行`scripts/autocode/onTsFile.js`中的代码

---
## 文件路径说明

1. `项目路径/autocode.config.json`  生成代码规则的配置
2. `项目路径/template/autocode`     生成代码的模板
3. `项目路径/script/autocode`       在`autocode.config.json` 中`fileVisit` 用户自定义执行的脚本

---


## 模板内所有变量对应的值


模板文件位置：  项目\template\autocode
|  变量名   | 描述  |  示例  |
|  ----  | ----  | ----  | 
| ${varDes}  | 所有的变量描述，方便编写模板时查看变量对应的内容 |  无 |
| ${initEvent}  | `项目/autocode.config.json`中`idVisit`自定义配置内容 事件监听 | `this.btnSuper.addEventListener(egret.TouchEvent.TOUCH_TAP, this.handleClkSuper, this)` |
| ${eventFunction}  | `项目/autocode.config.json`中`idVisit`自定义配置内容  事件监听对应的函数 | `private handleClkSuper(){		}` |
| ${fileName}  | 文件名字 | `TestPanelSkin` |
| ${auth}  | 开发者名字 可`ctr+p`输入`>Egret AutoCode 打开用户配置`修改配置中的`auth` | `cyj` |
| ${skinPath}  | 皮肤的绝对路径 | `d:\nodejs\autocode\egretautocodeeui\demo\test001\resource\skin\test\TestPanelSkin.exml` |
| ${shortSkinPath}  | 皮肤的相对路径 | `resource\skin\test\TestPanelSkin.exml` |
| ${time}  | 当前时间 | `2021-01-14 21:26:45` |
| ${skinName}  | 皮肤的名字 | `TestPanelSkin` |
| ${baseClsName}  | 类去掉`Skin/skin`的名字 | `TestPanel` |
| ${parentDir}  | 皮肤所在文件夹的名字 | `test` |
| ${varids}  | 类内所有变量的声明 | `public btnSuper:eui.Button;`<br>`public list:eui.List;`<br>`public title:eui.Label;`
| ${interfaceIds}  | interface中所有变量的声明 | `btnSuper:eui.Button;`<br>`list:eui.List;`<br>`title:eui.Label;` |
| ${shortName}  | 类的简短的名字 | `TestPanel` |
| ${moduleID}  | 类大写的名字 | `TEST_PANEL` |

