

import * as path from "path";
import { Log } from "../tools/Log";
import { EXmlParser } from "./ExmlParser";

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
        }else{
            Log.log("没有找到"+type+"对应的解析方法");
        }
    }
}
EgretAutoCodeEui.registerParser("exml", EXmlParser);