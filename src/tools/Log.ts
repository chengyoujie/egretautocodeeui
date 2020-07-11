import * as vscode from 'vscode';

export class Log{
    public static error(str:string)
    {
        console.log("Error: "+str);
        vscode.window.showErrorMessage(str);
    }

    public static log(str:string)
    {
        console.log("Log: "+str);
        vscode.window.showInformationMessage(str);
    }
}