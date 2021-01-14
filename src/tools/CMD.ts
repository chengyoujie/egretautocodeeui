
import * as childProcess from "child_process";//名字不能为process 否则wing中会执行不了插件
import { Log } from "./Log";

export type CmdCallBack = (str:string)=>void;

export class  CMD{
    
    /**
     * 执行CMD命令行
     * @param cmd           命令行
     * @param onSuccess     成功时处理
     * @param onError       错误时处理
     * @param workspace  工作空间
     */
    public static async run(cmd:string, thisObj?:any, onSuccess?:CmdCallBack, onError?:CmdCallBack, workspace:string=undefined, showLog?:boolean)
    {
        let p = childProcess.exec(cmd, {encoding:"utf8", cwd:workspace}, function(err:childProcess.ExecException, stdout:any, stderr:any){
            if(err)
            {
                if(onError)
                {
                    return onError.call(thisObj, err.message);
                }
            }else if(stderr){
                if(onError)
                {
                    return onError.call(thisObj, stderr);
                }
            }else{
                if(onSuccess)
                {
                    return onSuccess.call(thisObj, stdout);
                }
            }
        });
        p.stdout.on('data', function(data) {
            if(showLog)
            {
                Log.log(data);
            }else{
                console.log(data);
            }
        });
        p.stderr.on('data', function(data) {
            if(showLog)
            {
                Log.log("ERROR: "+data);
            }else{
                console.log("ERROR: "+data);
            }
        });
    }

}