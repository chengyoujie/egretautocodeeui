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
    moduleCodePath:string;
    /**皮肤的根路径 */
    skinRootPath:string;
    /**时间的格式 */
    timeFormat:string;
    /**id检索 */
    idVisit:IdVisitInfo[];
}


/**
 * id检索信息
 */
export interface IdVisitInfo{
    /**id的名字中包含的关键字 */
    nameHas:string;
    /**id的类型中包含的关键字 */
    typeHas:string;
    /**如果id中含有key则生成代码x中的代码 */
    code1?:string;
    /**生成的代码x的字符传  在模板文件的关键字名称 */
    exportCode1?:string;
}

/**创建模板的信息 */
interface CreateInfo{
    /**文件名中包含的特殊字符串， 如果多个可以用 | 分开 */
    keyword:string;
    /**使用那些模板生成 多个可以用,分开 */
    useTemplate:string;
    /**keyword 是否使用正则匹配 */
    keywordusereg:boolean;
}

/**每个具体模板的信息 */
interface TemplateInfo{
    /**模板的标识id */
    id:number;
    /**模板的名字  生成类名时 基础名字$baseClsName）加上name 作为类名  如要改动最好也检查下对应的模板文件（写死的）中*/
    name:string;
    /**模板文件名  在module/路径下 */
    file:string;
    /** 生成文件时 在对应模块文件下新建的文件夹名字*/
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
            this._userConfigPath = path.join(__dirname, "./../config/user.config");
        }
        return this._userConfigPath;
    }

    /**用户配置信息 */
    public static get userConfig():UserConfig
    {
        if(!this._userConfig)
        {
            let cfgPath = path.join(__dirname, "./../config/user.config");
            if(fs.existsSync(cfgPath))
            {
                this._userConfig = this.getJsonData(cfgPath);
            }
            if(!this._userConfig)
            {
                this._userConfig = {auth:"",  autoCodeConfigPath:"${workspace}/autocode.config.json", templetePath:"${workspace}/template/autocode"};
                Log.log("没有找到用户配置自动创建："+cfgPath);
                let cfgStr = JSON.stringify(this._userConfig);
                FileUtil.checkOrCreateDir(cfgPath);
                fs.writeFileSync(cfgPath, cfgStr, "utf-8");
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
        this._autoCodeConfig = null;
        this._userConfig = null;
        AppData.userConfig;
        AppData.autoCodeConfig;
        Log.log("配置信息更新成功");
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
                Log.log("系统自动生成:"+autoCfgPath);
                let defaultAutoCfgPath = path.join(__dirname, "./../config/template/autocode.config.json");
                this._autoCodeConfig = this.getJsonData(defaultAutoCfgPath);
                FileUtil.copy(defaultAutoCfgPath, autoCfgPath);
                //template 中的module也顺便拷过去
                let defaultAutoTemplatePath = path.join(__dirname, "./../config/template/codetemplate");
                FileUtil.copy(defaultAutoTemplatePath, this.userConfig.templetePath);
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
            var keys = create.keyword.split("|");
            for(let j=0; j<keys.length; j++)
            {
                if(create.keywordusereg)//使用正则
                {
                    try{
                        let reg = new RegExp(create.keyword, "gi");
                        if(reg.test(skinFileName))
                        {
                            return create;
                        }
                    }catch(e){
                        Log.log("create中正则错误："+this.userConfig.autoCodeConfigPath+" create:"+create.keyword);
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