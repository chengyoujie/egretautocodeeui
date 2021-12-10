/**用户的本地配置信息 */
export interface UserConfig{
    auth:string;
    templetePath:string;
    autoCodeConfigPath:string;
}
/**项目配置信息 */
export interface AutoCodeConfig{
    defaultCreateIndex:number;
    create:CreateInfo[];
    template:{[id:number]:TemplateInfo};
    codeRootPath:string;
    /**皮肤的根路径 */
    skinRootPath:string;
    /**时间的格式 如：yyyy-MM-dd hh:mm:ss 用于模板中的${time}变量*/
    timeFormat:string;
    /**id检索 遍历exml中遍历*/
    idVisit:IdVisitInfo[];
    /**文件检索信息 */
    fileVisit?:FileVisitInfo[];
}


/**
 * id检索信息
 */
export interface IdVisitInfo{
    /**id的名字中包含的关键字 */
    nameHas:string;
    /**id对应的类型中包含的关键字 */
    typeHas:string;
    /**如果id满足`nameHas`或者`typeHas` 则将 `code[数字]` 的内容 添加到对应的变量`exportCode[数字]` 中 其中`${id}` 为 当前exml中的id， `${Id}` 为 id的首字母大写， `${shortId}` 为 id去掉`nameHas`及下划线_后的值，`${ShortId}` 为 `shortId`首字母大写后的值*/
    code1?:string;
    /**`code[数字]`对应的值 在模板文件的关键字名称 */
    exportCode1?:string;
}

/**
 * 文件访问
 */
export interface FileVisitInfo{
    /**当前编辑的文件  如果需要使用正则则需要设置useReg为true */
    nameHas:string;
    /**文件名称匹配是否使用正则 */
    useReg:boolean;
    /**执行程序 */
    exec:string;
    /**执行程序的参数 */
    execParam:string;
    /**执行程序的工作目录  空则表示使用当前工作空间 */
    execWorkSpace:string;
    /**是否显示日志 */
    showLog?:boolean;
}

/**创建模板的信息 */
interface CreateInfo{
    /**文件名中包含的特殊字符串， 如果多个可以用 | 分开 */
    nameHas:string;
    /**使用那些模板生成 多个可以用,分开 */
    useTemplate:string;
    /**nameHas 是否使用正则匹配 */
    useReg:boolean;
}

/**每个具体模板的信息 */
interface TemplateInfo{
    /**模板的标识id */
    id:number;
    /**模板的名字  生成类名时 基础名字 `$baseClsName` 加上name 作为类名  如要改动最好也检查下对应的模板文件（写死的）中*/
    name:string;
    /**模板文件名  在module/路径下 */
    file:string;
    /** 生成文件夹 如果不填使用 `codeRootPath`  如果填了则使用配置的路径下*/
    outdir:string;
    /** 是否覆盖 true 每次生成都覆盖  false 如果有了就不生成了 */
    override:boolean;
    /**生成的文件后缀名 */
    fileType:string;
    /**检查当前文件夹是否存在，如果存在则不再生成 */
    checkfloder:boolean;
}

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Log } from "./tools/Log";
import { FileUtil } from "./tools/FileUtils";
import { StringUtil } from "./tools/StringUtils";
import * as vscode from 'vscode';
/**
 * 应用的数据
 * @auth cyj
 */
export class AppData{
    private static _userConfig:UserConfig;
    private static _autoCodeConfig:AutoCodeConfig;
    private static _userConfigPath:string;

    /**获取用户信息的配置 */
    public static get userConfigPath()
    {
        if(!this._userConfigPath)
        {
            this._userConfigPath = path.join(__dirname, "./../config/user.config.json");//path.join(os.homedir(), "/AppData/Local/egret-autocode", "user.config.json");
        }
        return this._userConfigPath;
    }

    /**用户配置信息 */
    public static get userConfig():UserConfig
    {
        if(!this._userConfig)
        {
            let cfgPath = this.userConfigPath;
            if(fs.existsSync(cfgPath))
            {
                this._userConfig = this.getJsonData(cfgPath);
            }
            if(!this._userConfig)
            {
                let defaultUserCfgPath = path.join(__dirname, "./../config/user.config.json");
                this._userConfig = this.getJsonData(defaultUserCfgPath);
                FileUtil.copy(defaultUserCfgPath, this.userConfigPath);
            }
            StringUtil.replaceAllVars(this._userConfig);
            this._userConfig.templetePath = path.normalize(this._userConfig.templetePath);
            this._userConfig.autoCodeConfigPath = path.normalize(this._userConfig.autoCodeConfigPath);
        }
        return this._userConfig;
    }
    /**更新配置 */
    public static refushConfig()
    {
        AppData._autoCodeConfig = null;
        AppData._userConfig = null;
        AppData.userConfig;
        AppData.autoCodeConfig;
        Log.alert("配置信息更新成功");
    }

    /**自动监听配置文件变化 */
    public static initWatch()
    {
        try{
            FileUtil.watchFile(this.userConfigPath, (event:string, fileName:string)=>{
                AppData._userConfig = null;
                AppData.userConfig;
                Log.log("用户配置自动更新成功");
            });
            FileUtil.watchFile(AppData.userConfig.autoCodeConfigPath, (event:string, fileName:string)=>{
                AppData._autoCodeConfig = null;
                AppData.autoCodeConfig;
                Log.log("代码生成配置自动更新成功");
            });
        }catch(e){

        }
    }

    /**
     * 获取autoCodeConfig
     */
    public static get autoCodeConfig():AutoCodeConfig
    {
        if(!this._autoCodeConfig)
        {
            let autoCfgPath = this.userConfig.autoCodeConfigPath;
            if(!fs.existsSync(autoCfgPath))
            {
                Log.alert("系统自动生成:"+autoCfgPath);
                
                if(fs.existsSync(path.join(this.workspace, "egretProperties.json")))//非egret项目不拷贝
                {
                    let defaultAutoCfgPath = path.join(__dirname, "./../config/template/autocode.config.json");
                    this._autoCodeConfig = this.getJsonData(defaultAutoCfgPath);
                    FileUtil.copy(defaultAutoCfgPath, autoCfgPath);
                     //template 中的module也顺便拷过去
                    let defaultAutoTemplatePath = path.join(__dirname, "./../config/template/codetemplate");
                    FileUtil.copy(defaultAutoTemplatePath, this.userConfig.templetePath, false);
                    //script也拷过去 中的module也顺便拷过去
                    let defaultAutoScriptPath = path.join(__dirname, "./../config/template/autocodescript/onTsFile.js");
                    FileUtil.copy(defaultAutoScriptPath, this.workspace+"/scripts/autocode/onTsFile.js", false);
                    console.log("当前是egret项目 自动模板")
                }else{
                    let defaultAutoCfgPath = path.join(__dirname, "./../config/template/autocode_notegret.config.json");
                    this._autoCodeConfig = this.getJsonData(defaultAutoCfgPath);
                    FileUtil.copy(defaultAutoCfgPath, autoCfgPath);
                    let defaultAutoScriptPath = path.join(__dirname, "./../config/template/autocodescript/onTsFile.js");
                    FileUtil.copy(defaultAutoScriptPath, this.workspace+"/scripts/autocode/onTsFile.js", false);
                    console.log("当前不是egret项目")
                }
               
            }else{ 

                
                this._autoCodeConfig = this.getJsonData(autoCfgPath);
            }
        }
        return this._autoCodeConfig;
    }

    /**根据皮肤文件的名字获取对应的创建文件信息 */
    public static getCreate(skinFileName:string)
    {
        let creates = this.autoCodeConfig.create;
        for(let i=0; i<creates.length; i++)
        {
            let create = creates[i];
            var keys = create.nameHas.split("|");
            for(let j=0; j<keys.length; j++)
            {
                if(create.useReg)//使用正则
                {
                    try{
                        let reg = new RegExp(create.nameHas, "gi");
                        if(reg.test(skinFileName))
                        {
                            return create;
                        }
                    }catch(e){
                        Log.alert("create中正则错误："+this.userConfig.autoCodeConfigPath+" create:"+create.nameHas);
                    }
                }else{
                    if(skinFileName.indexOf(keys[j]) != -1)
                    {
                        return create;
                    }
                }
            }
        }
        return creates[this.autoCodeConfig.defaultCreateIndex];
    }

    /**
     * 根据模板id获取模板配置信息
     * @param templateId 
     */
    public static getTemplateInfo(templateId:number):TemplateInfo
    {
        let templateInfo = this.autoCodeConfig.template[templateId];
        if(!templateInfo)
        {
            Log.error("没有找到："+templateId+"对应的模板配置 在："+this.userConfig.autoCodeConfigPath);
            return null;
        }
        return templateInfo;
    }

    /**根据json路径获取json数据 */
    public static getJsonData(jsonPath:string){
        let data:any;
        if(!fs.existsSync(jsonPath))
        {
            Log.error("路径不存在"+jsonPath);
        }
        try{
            let autoCodeCfgStr = fs.readFileSync(jsonPath, "utf-8");
            data = JSON.parse(autoCodeCfgStr);
        }catch(e){
            Log.error("解析JSON错误："+jsonPath);
        }
        return data;
    }

    /**
     * 当前VScode的工作目录
     */
    public static get workspace()
    {
        return vscode.workspace.rootPath;
    }

    
}