

import * as path from "path";
import { Log } from "../tools/Log";
import { EXmlParser } from "./ExmlParser";
import { TSParser } from "./TSParser";
import { AppData, FileVisitInfo } from "../AppData";
import { CMD } from "../tools/CMD";
import * as vscode from 'vscode';
import { StringUtil } from "../tools/StringUtils";

export interface IParser{

}

export class EgretAutoCodeEui{

    private static _parserDic:{[type:string]:{new (url:string):IParser}} = {};

    public static registerParser(type:string, parser:{new (url:string):IParser})
    {
        EgretAutoCodeEui._parserDic[type] = parser;
    }

    public static parse(url:string)
    {
        let pathInfo = path.parse(url);
        let type = (pathInfo.ext.charAt(0)==='.')?pathInfo.ext.substr(1):pathInfo.ext;
        let parser = EgretAutoCodeEui._parserDic[type];
        if(parser)
        {
            new parser(url);
        }
        // else{
        //     Log.log("没有找到"+type+"对应的解析方法");
        // }
        let fileVisits = AppData.autoCodeConfig.fileVisit;
        if(fileVisits)
        {   
            for(let i=0; i<fileVisits.length; i++)
            {
                if(this.checkFileVisit(fileVisits[i], url))
                {
                    this.runFileVisit(fileVisits[i], url);
                }
            }
        }
    }

    /**
     * 检测当前url是否满足fileVisitInfo 的条件
     * @param fileVisit 
     * @param url 
     */
    private static checkFileVisit(fileVisit:FileVisitInfo, url:string)
    {
        if(fileVisit.useReg)
        {
            let reg = new RegExp(fileVisit.nameHas);
            if(reg.test(url))
            {
                return true;
            }
        }else{
            if(url.indexOf(fileVisit.nameHas) != -1)
            {
                return true;
            }
        }
        return false;
    }
    /***
     * 执行FileVisitInfo中的命令
     */
    private static runFileVisit(fileVisit:FileVisitInfo, url:string)
    {
        
        let param = fileVisit.execParam;
        let workSpace = fileVisit.execWorkSpace || "${workspace}";
        let selectStart = 0;
        let selectEnd = 0;
        let exec = fileVisit.exec;
        let edit = vscode.window.activeTextEditor;
        if(edit)
        {
            selectStart= edit.document.offsetAt(edit.selection.start);
            selectEnd = edit.document.offsetAt(edit.selection.end);
        }
        let paramDic = {filePath:url, selectStart, selectEnd};
        workSpace = StringUtil.replaceVars(workSpace, paramDic);
        param = StringUtil.replaceVars(param, paramDic);
        exec = StringUtil.replaceVars(exec, paramDic);
        let runCode = exec+" "+param;
        CMD.run(runCode, this, (str:string)=>{
            Log.log("执行成功："+runCode);
        }, (err:string)=>{
            Log.error("执行失败"+runCode+" Error: "+err);
        }, workSpace);
    }


}
EgretAutoCodeEui.registerParser("exml", EXmlParser);
//因为写死的对外先不开放
// EgretAutoCodeEui.registerParser("ts", TSParser);