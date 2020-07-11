
import { AppData } from '../AppData';

export class StringUtil{

    /**
     * 替换obj的所有变量值中的字符串中${要替换的字符串}  
     * @param obj 
     * @param varDic 
     */
    public static replaceAllVars(obj:any, ...varDics:{[key:string]:any}[])
    {
        if(typeof obj == "object")
        {
            for(let key in obj)
            {
                obj[key] = this.replaceAllVars(obj[key]);
            }
            return obj;
        }else if(typeof obj == "string"){
            return this.replaceVars(obj, ...varDics);
        }else{
            return obj;
        }
    }

    /**
     * 替换${aaa}的字符变量
     * @param str 需要替换的文本
     * @param varDic 变量的dic
     */
    public static replaceVars(str:string, ...varDic:{[key:string]:any}[]):string
    {
        if(!str){return "";}
        let reg = /\$\{\s*(.*?)\s*\}/gi;
        let arr;
        while(arr = reg.exec(str))
        {
            str = str.replace(arr[0], this.getReplaceVars(arr[1], ...varDic));
            reg.lastIndex = 0;
        }
        return str;
    }
    /**
     * 根据字符变量 返回对应的值
     * @param str 要替换的字符串
     * @param varDic 需要替换文本的dic varDic[要替换的字符串] = 替换后的字符串
     */
    private static getReplaceVars(str:string, ...varDics:{[key:string]:any}[]):string
    {
        if(varDics && varDics.length>0)
        {
            for(let i=0; i<varDics.length; i++)
            {
                if(varDics[i][str])
                {
                    return varDics[i][str];
                }
            }
        }
        switch(str)//项目常量
        {
            case "workspace": return  AppData.workspace;
            case "templatePath": return AppData.userConfig.templetePath;
        }
        return "";
    }
}