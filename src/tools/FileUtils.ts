
import * as fs from "fs";
import * as path from "path";
import { Log } from "./Log";

export class FileUtil{
    
    /**创建新的文件夹 */
    public static checkOrCreateDir(filePath:string)
    {
        filePath = path.normalize(filePath);
        let pinfo = path.parse(filePath);
        let arr = pinfo.dir.split(path.sep);
        if(pinfo.base.indexOf(".") == -1)//名字中没有.的按照文件夹处理
        {
            arr.push(pinfo.base);
        }
        if(!arr || arr.length == 0)return;
        let dirpath = arr[0];
        for(let i=1; i<arr.length; i++)
        {
            dirpath = dirpath + path.sep+arr[i];
            if(!fs.existsSync(dirpath))
            {
                fs.mkdirSync(dirpath);
            }
        }
    }

    /**保存文件， 如果文件夹不存在则会创建文件夹 */
    public static saveFile(path:string, data:string)
    {
        this.checkOrCreateDir(path);
        fs.writeFileSync(path, data, "utf-8");
    }

    /**
     * 删除文件及其子文件夹
     * @param url 
     */
    public static rmdirSync(url:string) {
        var files = [];
        if (fs.existsSync(url)) {
            files = fs.readdirSync(url);
            files.forEach(function(file, index) {
                var subUrl = path.join(url, file);
                if (fs.statSync(subUrl).isDirectory()) { // recurse
                    this.rmdirSync(subUrl);
                } else { // delete file
                    fs.unlinkSync(subUrl);
                }
            });
            fs.rmdirSync(url);
        }
    }
    
    /**
     * 遍历文件
     * @param url 
     * @param onFile 
     * @param onDir 
     * @param thisObj 
     */
    public static walkDir(url:string,onFile?:(url:string)=>any,onDir?:(url:string)=>any,thisObj?:any) {
        url = path.normalize(url);
        var stats = fs.statSync(url);
        if (stats.isDirectory()) {
            if(onDir) onDir.call(thisObj,url);
            var files = fs.readdirSync(url);
            for (var i = 0, len = files.length; i < len; i++) {
                this.walkDir(path.join(url,files[i]),onFile,onDir,thisObj);
            }
            return true;
        } else {
            if(onFile) onFile.call(thisObj,url);
            return false;
        }
    }
    
    /**
     * 拷贝文件
     * @param url 
     * @param toUrl 
     * @param override 
     */
    public static copy(url:string, toUrl:string, override:boolean=true)
    {
        if(!fs.existsSync(url))
        {
            Log.error("拷贝失败：没有找到"+url);
            return;
        }
        FileUtil.checkOrCreateDir(toUrl);
        var stats = fs.statSync(url);
        if (stats.isDirectory()) {
            url = path.normalize(url); 
            this.walkDir(url, (walkUrl:string)=>{
                let walkToUrl = walkUrl.replace(url, toUrl);
                if(!override && fs.existsSync(walkToUrl))return;
                fs.copyFileSync(walkUrl, walkToUrl);
            });
        }else{
            if(!override && fs.existsSync(toUrl))return;
            fs.copyFileSync(url, toUrl);
        }
        
    }
}