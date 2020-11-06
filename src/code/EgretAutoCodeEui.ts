

import * as path from "path";
import * as fs from "fs";
import { Log } from "../tools/Log";
import { EXmlParser } from "./ExmlParser";
import { AppData, FileVisitInfo } from "../AppData";
import { CMD } from "../tools/CMD";
import * as vscode from 'vscode';
import { StringUtil } from "../tools/StringUtils";
import { FileUtil } from "../tools/FileUtils";
import { fstat } from "fs";

export interface IParser{

}

export class EgretAutoCodeEui{

    private static _parserDic:{[type:string]:{new (url:string, notShowAlert?:boolean):IParser}} = {};
    /**观察模式文件改变的文件或文件夹*/
    private static _watchList:string[] = [];
    /**观察文件改变的延迟处理的  setTimeOutid */
    private static _watchFileDelay:{[filePath:string]:boolean} = {};

    public static registerParser(type:string, parser:{new (url:string, notShowAlert?:boolean):IParser})
    {
        EgretAutoCodeEui._parserDic[type] = parser;
    }

    public static parse(url:string, notShowAlert?:boolean)
    {
        let pathInfo = path.parse(url);
        let type = (pathInfo.ext.charAt(0)==='.')?pathInfo.ext.substr(1):pathInfo.ext;
        let parser = EgretAutoCodeEui._parserDic[type];
        if(parser)
        {
            new parser(url, notShowAlert);
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
    /**开启关闭文件监听 */
    public static watchFile(filePath:string)
    {
        let s = this;
        let index = s._watchList.indexOf(filePath);
        if(index != -1)
        {
            try{
                FileUtil.unWatch(filePath);
                s._watchList.splice(index, 1);
                Log.log("取消监听文件变化 " + filePath);
            }catch(e){
                Log.log("取消监听失败: "+filePath + "error:"+e.message);
            }
        }else{
            // FileUtil.watch(filePath, s.handleWatchFileChange);
            try{
                
                FileUtil.watch(filePath, (eventName, fPath)=>{
                    EgretAutoCodeEui.handleWatchFileChange(eventName, filePath);
                });
                s._watchList.push(filePath);
                Log.log("监听文件变化 "+filePath);
            }catch(e){
                Log.log("添加监听失败: "+filePath + "error:"+e.message);
            }
        }
    }

    private static handleWatchFileChange(eventName:string, filePath:string):void
    {
        if(eventName == "rename")
        {
            Log.log(`监听到文件${filePath}被删除了，移除文件监听`);
            EgretAutoCodeEui.watchFile(filePath);
            return;
        }
        if(!EgretAutoCodeEui._watchFileDelay[filePath])
        {
            EgretAutoCodeEui._watchFileDelay[filePath] = true;
            setTimeout(()=>{
                // Log.log("文件改变： "+filePath+" 自动执行生成");
                EgretAutoCodeEui.parse(filePath);
                EgretAutoCodeEui._watchFileDelay[filePath] = false;
            }, 2000);
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
            Log.alert("执行成功："+runCode);
            if(vscode.window.activeTextEditor)
            {
                vscode.window.activeTextEditor.document.save();
            }
        }, (err:string)=>{
            Log.error("执行失败"+runCode+" Error: "+err);
        }, workSpace);
    }


}
EgretAutoCodeEui.registerParser("exml", EXmlParser);