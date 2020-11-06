# EgretAutoCodeEui

根据当前编辑器中的exml 文件生成对应的代码，减少重复劳动 [github 地址](https://github.com/chengyoujie/egretautocodeeui) 

![AutoCodeEui自动生成](https://raw.githubusercontent.com/chengyoujie/egretautocodeeui/master/images/usef12.gif)

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

-----
# 命令说明

## Egret AutoCode Exml生成代码 (快捷键 F12)
    根据当前打开的exml文件生成代码

## Egret AutoCode 打开用户配置
    打开 用户自定义的配置，可以配置  用户名，autocode配置路径，模板路径

## Egret AutoCode  打开生成代码配置
    打开 autocode配置 可以配置模板的关系，等

## Egret Egret AutoCode  刷新配置
    如果修改过用户配置或者autocode配置 需要重新刷新或者重启VScode才生效

## Egret Egret AutoCode  打开模板文件夹
    打开用户模板所在的文件夹

-----

# 配置文件说明
## 用户配置文件  `user.config.json`

如需修改可使用快捷键 `ctr+shift+p` 打开输入框中输入`Egret AutoCode 打开用户配置`

> **auth** 使用者的名字

> **templetePath** 模板文件夹的路径 `${workspace}`为当前编辑器的工作路径 默认：`${workspace}/template/autocode`

> **autoCodeConfigPath**  `${workspace}`为当前编辑器的工作路径 默认：`${workspace}/autocode.config.json`

---

## 自动生成代码配置  `autocode.config.json`

如需修改可使用快捷键 `ctr+shift+p` 打开输入框中输入`Egret AutoCode  打开生成代码配置`

> **defaultCreateIndex**  如果配置中`create`的条件都不满足, 默认使用create的索引

> **skinRootPath** 皮肤的根路径 

> **codeRootPath** 生成代码的默认根路径

> **create** 生成规则

>> **nameHas** 文件名中包含的特殊字符串， 如果多个可以用 | 分开

>> **useTemplate** 使用那些模板生成 多个可以用,分开

>> **useReg** nameHas 是否使用正则匹配

> **template** 模板文件信息

>> **id** 模板标识  在`create`的`useTemplate`中用到

>> **name** 模板的名字  生成类名时 基础名字 `$baseClsName` 加上name 作为类名  如要改动最好也检查下对应的模板文件（写死的）中

>> **file** 模板文件名  在`user.config` 配置的`templetePath`路径下

>> **outdir** 生成文件夹 如果不填使用 `codeRootPath`  如果填了则使用配置的路径下

>> **override** 是否覆盖 true 每次生成都覆盖  false 如果有了就不生成了

>> **fileType** 生成的文件后缀名

>> **checkfloder** 检查当前文件夹是否存在，如果存在则不再生成

> **timeFormat**  时间的格式 如：yyyy-MM-dd hh:mm:ss 用于模板中的${time}变量

> **idVisit** id检索 遍历exml中遍历

>> **nameHas** id的名字中包含的关键字

>> **typeHas** id对应的类型中包含的关键字

>> **code`数字`**  如果id满足`nameHas`或者`typeHas` 则将 `code[数字]` 的内容 添加到对应的变量`exportCode[数字]` 中 其中`${id}` 为 当前exml中的id， `${Id}` 为 id的首字母大写， `${shortId}` 为 id去掉`nameHas`及下划线_后的值，`${ShortId}` 为 `shortId`首字母大写后的值

>> **exportCode`数字`**  `code[数字]`对应的值 在模板文件的关键字名称

> **fileVisit** 当前打开的文件 执行`F12`或`Egret AutoCode Exml生成代码` 时如果满足`nameHas`的条件后执行配置的程序

>> **nameHas** id的名字中包含的关键字

>> **useReg** `nameHas`匹配时是否使用正则

>> **exec**  满足条件后执行的程序

>> **execWorkSpace** 程序执行的工作目录， 默认为当前的工作目录

>> **execParam** 执行的参数   可选变量 `${filePath}` 当前打开的文件目录 , `${selectStart}`当前文件中选择的开始位置, `${selectEnd}` 当前文件中选择结束的位置  `${workspace}`为当前编辑器的工作路径
---

## 模板文件中的变量

如需修改可使用快捷键 `ctr+shift+p` 打开输入框中输入`Egret AutoCode  打开模板文件夹`

> **auth** 生成代码者名字

> **time** 生成时间  格式可在 `autocodeconfig.json`的`timeFormat` 中配置

> **skinPath** 生成代码的exml 文件路径

> **shortSkinPath** 生成代码的exml的相对（工作空间）路径

> **fileName** Exml文件的名字

> **baseClsName** 类的基础名字  skinName去掉Skin后的名字

> **skinName** 皮肤的名字

> **parentDir** 当前 exml文件相对于 模板配置autocode.config中skinRootPath的目录

> **varids** 变量的声明 变量前有public  如：public img:eui.Image;

> **interfaceIds** interface中变量的声明 如  img:eui.Image;

> **shortName** 皮肤简短的名字， 去掉Skin, 与模板配置中create的keyword相同的字符， 并且首字符大写

> **moduleID** 模块的名字  shortName的大写 遇到之前大写的前面加上 _ 
