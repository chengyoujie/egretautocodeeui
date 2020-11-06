import * as vscode from 'vscode';

export class Log{
    private static opc = vscode.window.createOutputChannel('autoCodeOut'); // 可以有多个OutputChannel共存，使用参数名区分

    public static error(str:string)
    {
        Log.log("Error: "+str);
        vscode.window.showErrorMessage(str);
    }

    public static alert(str:string)
    {
        Log.log("Log: "+str);
        vscode.window.showInformationMessage(str);
    }

    //输出到控制台上
    public static log(str:string){
        
        Log.opc.appendLine(str); // 追加一行
        Log.opc.show(true);
    }
}