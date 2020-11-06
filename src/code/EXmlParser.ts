import {IParser } from "./EgretAutoCodeEui";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Log } from "../tools/Log";
// import XMLParser = require("./../../libs/xml/index");
// import * as XMLParser  from "./../lib/xml/index";
import * as XMLParser from "./../tools/xml/index";
import { AppData, IdVisitInfo } from "../AppData";
import { StringUtil } from "../tools/StringUtils";
import { FileUtil } from "../tools/FileUtils";
import { DateUtils } from "../tools/DateUtils";

export interface TemplateVars{
    /**生成代码者名字 */
    auth?:string;
    /**生成时间  格式可在 `autocodeconfig.json`的`timeFormat` 中配置*/
    time?:string;
    /**生成代码的exml 文件路径 */
    skinPath?:string;
    /**生成代码的exml的相对（工作空间）路径 */
    shortSkinPath?:string;
    /**Exml文件的名字 */
    fileName?:string;
    /**类的基础名字  skinName去掉Skin后的名字 */
    baseClsName?:string;
    /**皮肤的名字 */
    skinName?:string;
    /**当前 exml文件相对于 模板配置autocode.config中skinRootPath的目录 */
    parentDir?:string;
    /**变量的声明 变量前有public  如：public img:eui.Image;*/
    varids?:string;
    /**interface中变量的声明 如  img:eui.Image;*/
    interfaceIds?:string;
    /**皮肤简短的名字， 去掉Skin, 与模板配置中create的keyword相同的字符， 并且首字符大写 */
    shortName?:string;
    /**模块的名字  shortName的大写 遇到之前大写的前面加上 _ */
    moduleID?:string;
} 


/**Eui中id变量信息 */
interface IdInfo{
    /**变量名字 */
	name:string;
    /**变量模块名 */
	module:string;
    /**变量类名 */
    clsName:string;
    /**类的完整名字  包含  模块.类名 如 eui.Label */
    fullClsName:string;
}

/**
 * 对Exml进行解析
 * @auth  cyj
 */
export class EXmlParser implements IParser{
    private _url:string;
    private _content:string="";
    private _xmlObj:egret.XML;
    private _tempVars:TemplateVars = {};
    private _visitDic:{[exportKey:string]:string} = {};
    private _notShowAlert:boolean;

    constructor(url:string, notShowAlert?:boolean)
    {
        this._url = url;
        this._notShowAlert = notShowAlert;
        if(!fs.existsSync(this._url))
        {
            Log.error("没有找到： "+this._url+"文件");
            return;
        }
        this._content = fs.readFileSync(this._url, 'utf-8');
        try{
            this._xmlObj = XMLParser.parse(this._content);
        }catch(e){
            Log.error("XML解析错误 "+this._url);
        }
        this.createCode();
    }
    /**
     * 生成代码
     */
    private createCode()
    {
        if(!this._xmlObj){return;}
        let templateVars:TemplateVars = this._tempVars;
        let pathinfo = path.parse(this._url);
        let skinRootPath = path.join(AppData.workspace, AppData.autoCodeConfig.skinRootPath);
        templateVars.fileName = pathinfo.name;
        templateVars.auth = AppData.userConfig.auth || os.hostname();
        templateVars.skinPath = this._url;
        templateVars.shortSkinPath = path.relative(AppData.workspace, this._url);
        templateVars.time = DateUtils.getDateStr(AppData.autoCodeConfig.timeFormat);
        let skinName = templateVars.skinName = this._xmlObj.attributes.class;
        templateVars.baseClsName = skinName.replace(/^(.*?)EuiSkin$/i, "$1").replace(/^(.*?)Skin$/i, "$1");
        let children = this._xmlObj.children;
        let ids:IdInfo[] = [];
        this.searchXmlIds(children, ids);//解析子对象
        let createIdDic:{[id:number]:boolean} = {};//重名id检测
        //
        let skinDir = pathinfo.dir;
        let skinPathIndex = skinDir.indexOf(skinRootPath);
        if(skinPathIndex != -1)//如果文件在skinRootPath目录下则使用相对目录作为parentDir
        {
            templateVars.parentDir = pathinfo.dir.substr(skinPathIndex+skinRootPath.length);
        }else{//如果没有在skinRootPath中找到该文件则使用该文件的上级目录
            let pathdirarr = skinDir.split(path.sep);
            templateVars.parentDir = pathdirarr[pathdirarr.length-1];
        }
        //根据id生成对应变量声明及事件声明
        let varids = "";
        let interfaceIds = "";
        for(let i=0; i<ids.length; i++)
        {
            let id = ids[i];
            let preAdd = "";
            if(createIdDic[id.name])preAdd = "//";
            varids += preAdd+"public "+id.name+":"+id.fullClsName+";\n\t\t";
            interfaceIds += preAdd+id.name+":"+id.fullClsName+";\n\t\t";
            //循环遍历exml的id
            let idVisit = AppData.autoCodeConfig.idVisit;
            if(idVisit && idVisit.length>0)
            {
                for(let m=0; m<idVisit.length; m++)
                {
                    let visitInfo = idVisit[m];
                    if(visitInfo.nameHas)
                    {
                        if(id.name.indexOf(visitInfo.nameHas) != -1)
                        {
                            this.visit(visitInfo, id);
                        }
                    }else if(visitInfo.typeHas)
                    {
                        if(id.fullClsName.indexOf(visitInfo.typeHas) != -1)
                        {
                            this.visit(visitInfo, id);
                        }
                    }
                }
            }
            createIdDic[id.name] = true;
        }
        templateVars.varids = varids;
        templateVars.interfaceIds = interfaceIds;
        //创建代码文件
        this.createCodeFiles();
    }

    private visit(visitInfo:IdVisitInfo, idInfo:IdInfo)
    {
        let idUpName = idInfo.name.charAt(0).toUpperCase()+idInfo.name.substr(1);
        let shortId = idInfo.name.replace(visitInfo.nameHas, "").replace("_", "");
        let ShortId = shortId.charAt(0).toUpperCase()+shortId.substr(1);
        let localDic = {id:idInfo.name,  Id:idUpName, shortId, ShortId};
        let codeReg = /^code(\d+)$/gi;
        let exportCode = "exportCode";
        for(let key in visitInfo)
        {
            codeReg.lastIndex = 0;
            let arr = codeReg.exec(key);
            if(arr && arr.length>1)
            {
                let exportKey = visitInfo[exportCode+arr[1]];
                if(exportKey)
                {
                    let exportStr = StringUtil.replaceVars(visitInfo[key], localDic, this._tempVars);
                    if(!this._visitDic[exportKey])
                    {
                        this._visitDic[exportKey] = "";
                    }
                    this._visitDic[exportKey] += exportStr;
                }
            }
        }
    }

    /**
     * 创建代码文件
     * @param templateVars 
     */
    private createCodeFiles()
    {
        let templateVars:TemplateVars = this._tempVars;
        let createInfo = AppData.getCreate(templateVars.baseClsName);
        let templateIds = createInfo.useTemplate.split(",");
        if(!templateIds || templateIds.length==0)
        {
            Log.alert("当前没有对应的模板"+templateVars.baseClsName+" createInfo:"+createInfo.useTemplate);
            return;
        }
        // 生成 shortName及ModuleId变量
        let keywords = createInfo.nameHas.split("|");
        for(let j=0; j<keywords.length; j++)
        {
            if(templateVars.baseClsName.indexOf(keywords[j]) != -1)
            {
                templateVars.shortName = templateVars.baseClsName.replace(keywords[j], "");
                break;
            }
        }
        if(!templateVars.shortName)templateVars.shortName = templateVars.baseClsName;
        // templateVars.shortName = templateVars.shortName.charAt(0).toUpperCase()+templateVars.shortName.substr(1);
        templateVars.moduleID = this.getModuleID(templateVars.shortName);
        //开始生成文件
        for(let i=0; i<templateIds.length; i++)
        {
            this.createOneTemplateFile(+templateIds[i]);
        }
    }
    
    /**
     * 根据模板id和需要替换的模板变量 生成文件
     * @param templateId 
     */
    private createOneTemplateFile(templateId:number)
    {
        let templateInfo = AppData.getTemplateInfo(templateId);
        if(!templateInfo)return;
        let templatePath = path.join(AppData.userConfig.templetePath, templateInfo.file);
        if(!fs.existsSync(templatePath))
        {
            Log.error("没有找到模板文件："+templatePath);
            return;
        }
        let templateVars:TemplateVars = this._tempVars;
        let templateTxt = fs.readFileSync(templatePath, "utf-8");
        let outDirPath = path.join(AppData.workspace, AppData.autoCodeConfig.codeRootPath+templateVars.parentDir+"/");
        if(templateInfo.outdir)
        {
            outDirPath = StringUtil.replaceVars(templateInfo.outdir, templateVars);
        }
        let outpath = path.join(outDirPath, templateVars.shortName+templateInfo.name+"."+templateInfo.fileType);
        let exists = fs.existsSync(outpath);
        if(!templateInfo.override && exists)//检查文件是否覆盖
        {
            Log.log(outpath+" 文件已存在不用生成");
            return;
        }
        if(templateInfo.checkfloder)//检查文件夹是否存在
        {
            let outpathinfo = path.parse(outpath);
            if(fs.existsSync(outpathinfo.dir))
            {
                Log.log(outpathinfo+" 文件夹已存在不用生成");
                return;
            }
        }
        let areaDic={};//保存保护域的内容 如 /*****area1--start*******/保护域的内容/*****area1--end*******/
        if(exists)//如果存在保护域则先记录保护域的内容
        {
            let reg = /\/\*+area(\d+)--start\*+\/([\s\S]*)\/\*+area\1--end\*+\//gi;
            let oldContent = fs.readFileSync(outpath, 'utf-8');
            let rect;
            while(rect= reg.exec(oldContent))
            {
                areaDic[rect[1]] = rect[2];
            }
        }
        var viewcode = StringUtil.replaceVars(templateTxt, this._visitDic, templateVars);
        if(exists)//将保护域的内容在重新放到生成的文件中
        {
            for(let key in areaDic)
            {
                let reg = new RegExp("(\\/\\*+area"+key+"--start\\*+\\/)([\\s\\S]*)(\\/\\*+area"+key+"--end\\*+\\/)", "gi");
                viewcode = viewcode.replace(reg, "$1"+areaDic[key]+"$3");
            }
        }
        FileUtil.saveFile(outpath, viewcode);
        if(!this._notShowAlert)
            Log.alert("创建成功 "+outpath);

    }

    /**根据module名字生成ModuleID  生成规则 moduleName原始字符中大写前加上_并把所有字符转成大写 */
    private getModuleID(moduleName:string)
    {
        let idkey:string = "";
        for(let i=0; i<moduleName.length; i++)
        {
            let char = moduleName[i].toLocaleUpperCase();
            if(char == moduleName[i])
            {
                if(idkey)
                    idkey = idkey + "_";
            }
            idkey += char;
        }
        return idkey;
    }

    /**
     * 查找xml中的id
     * @param children 
     * @param ids 
     */
    private searchXmlIds(children:egret.XMLNode[], ids:IdInfo[])
    {
        if(!children)return;
        for(let i=0; i<children.length; i++)
        {
            let node:egret.XML = children[i] as egret.XML;
            if(node.name == "e:Skin")continue;//内置的皮肤不予处理  如button的皮肤
            if(node.name == "w:Config")continue;//w:config的不管他
            if(node.attributes && node.attributes.id)//有id的字段
            {
                let clsName = node.localName;
                let moduleName = node.prefix;
                if(moduleName == "e")
                {
                    moduleName = "eui";
                }
                let fullClsName:string;
                if(moduleName)
                {
                    fullClsName = moduleName+"."+node.localName;
                }else{
                    fullClsName = node.localName;
                }
                ids.push({name:node.attributes.id, module:moduleName, clsName, fullClsName});
            }
            if(node.children)
            {
                this.searchXmlIds(node.children, ids);
            }
        }
    }

}
