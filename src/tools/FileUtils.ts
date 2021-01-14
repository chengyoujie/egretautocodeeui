
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
                this.copyFileSync(walkUrl, walkToUrl, override);
            });
        }else{
            this.copyFileSync(url, toUrl, override);
        }
    }

    /**
     * 同步拷贝文件
     * @param url 
     * @param toUrl 
     * @param override 
     */
    private static copyFileSync(url:string, toUrl:string, override:boolean=true)
    {
        if(!override && fs.existsSync(toUrl))return;
        if(fs.copyFileSync)//有的版本的nodejs可能没有这个方法导致报错
        {
            fs.copyFileSync(url, toUrl);
        }else{
            let data = fs.readFileSync(url);
            fs.writeFileSync(toUrl, data);
        }
    }
    
    // /**
    //  * 监听具体的文件变化
    //  * @param filePath 
    //  * @param listener 
    //  */
    // public static watchFile(filePath:string, listener:(curr: fs.Stats, prev: fs.Stats) => void){
    //     fs.watchFile(filePath, listener);
    // }

    // /**
    //  * 去除监听文件的变化
    //  * @param filePath 
    //  * @param listener 
    //  */
    // public static unWatchFile(filePath:string, listener?:(curr: fs.Stats, prev: fs.Stats) => void){
    //     fs.unwatchFile(filePath, listener);
    // }

    /**
     * 监听文件变化（注有可能会一个文件改变会重复调用两次）
     * @param filePath  需要监听的文件路径，有可能是文件或者文件夹
     * @param listener  监听变化的函数
     * @param ignoreDirs 忽略的文件名称列表
     * @returns 被监听的文件或文件夹路径数组
     */
    public static watch(filePath:string, listener:(event: string, filename: string) => any, ignoreDirs?:string[])
    {
        let fileStat = fs.statSync(filePath);
        let watchList = [];
        if(fileStat.isDirectory())
        {
            fs.watch(filePath, listener);
            let files = fs.readdirSync(filePath);
            for(let i=0; i<files.length; i++)
            {
                let fPath = path.join(filePath, files[i]);
                if(ignoreDirs && ignoreDirs.includes(files[i]))continue;
                let fStat = fs.statSync(fPath);
                if(fStat.isDirectory())
                {
                    watchList.push(fPath);
                    FileUtil.watch(fPath, listener);
                }
            }
        }else{
            watchList.push(filePath);
            fs.watch(filePath,listener);
        }
        return watchList;
    }

    private static _watchFileContent:{[filePath:string]:any}= {};
    public static watchFile(filePath:string, listener:(event:string, fileName:string)=>any)
    {
        if(!filePath)return;
        filePath = path.normalize(filePath);
        if(!fs.existsSync(filePath))
        {
            console.log("watchFile 监听文件变化 "+filePath+" 文件不存在");
            return;
        }
        if(fs.statSync(filePath).isDirectory())
        {
            console.log("watchFile 监听的不能是文件夹： "+filePath);
            return;
        }
        FileUtil._watchFileContent[filePath] = fs.readFileSync(filePath);
        fs.watch(filePath,(evt, fileName)=>{
            let fileContetn:any;
            if(fs.existsSync(filePath))
            {
                fileContetn = fs.readFileSync(filePath);
            }
            if(FileUtil._watchFileContent[filePath] != fileContetn)
            {
                FileUtil._watchFileContent[filePath] == fileContetn;
                listener(evt, filePath);
            }
        });
    }

    public static unWatchFile(filePath:string)
    {
        if(!filePath)return;
        filePath = path.normalize(filePath);
        fs.unwatchFile(filePath);
        FileUtil._watchFileContent[filePath] = undefined;
    }

    /**
     * 停止监听某个文件夹
     * @param filePath 
     */
    public static unWatch(filePath:string)
    {
        let fileStat = fs.statSync(filePath);
        let watchList = [];
        if(fileStat.isDirectory())
        {
            fs.unwatchFile(filePath);
            let files = fs.readdirSync(filePath);
            for(let i=0; i<files.length; i++)
            {
                let fPath = path.join(filePath, files[i]);
                let fStat = fs.statSync(fPath);
                if(fStat.isDirectory())
                {
                    watchList.push(fPath);
                    FileUtil.unWatch(fPath);
                }
            }
        }else{
            watchList.push(filePath);
            fs.unwatchFile(filePath);
        }
        return watchList;
    }

    /**
     * 停止监听路径数组的文件改变监听
     * @param watchFileList 
     */
    public static unWatchList(watchFileList:string[])
    {
        if(!watchFileList)return;
        for(let i=0; i<watchFileList.length; i++)
        {
            fs.unwatchFile(watchFileList[i]);
        }
    }
    

}