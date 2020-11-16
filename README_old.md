# EgretAutoCodeEui

根据当前编辑器中的exml 文件生成对应的代码

![AutoCodeEui自动生成](https://img-blog.csdnimg.cn/20201107162857979.gif)

---

## 使用说明：

1.在编辑器中打开当前需要导出的exml文件。

2.按下快捷键F12 导出代码文件。(或者使用快捷键 `ctr+shift+p` 打开输入框中输入`Egret AutoCode Exml生成代码` 按下回车即可 )

或者可以 通过  ctrl+F12  监听文件变化自动生成

---
## 文件路径说明

1. `项目路径/autocode.config.json`  生成代码规则的配置
2. `项目路径/template/autocode`     生成代码的模板
3. `项目路径/script/autocode`       在`autocode.config.json` 中`fileVisit` 用户自定义执行的脚本
