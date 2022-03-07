// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EgretAutoCodeEui } from './code/EgretAutoCodeEui';
import { AppData } from './AppData';
import { Log } from './tools/Log';
import {exec} from "child_process";
import { FileUtil } from './tools/FileUtils';
/**
 * 组件激活的时
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {
	Log.log('"egretautocodeeui" is now active! Please Press F12 To Export Code');
	// AppData.initWatch();
	if(!AppData.userConfig.auth)
	{
		vscode.window.showErrorMessage(`AutoCode 没有配置auth用户名字，最好配置下 ctr+shift+p 输入  Egret AutoCode 打开用户配置 设置auth的值`, '打开配置项').then(selection => {
			if (selection === '打开配置项') {
			  vscode.commands.executeCommand('egretautocodeeui.egretautocodeuserconfig');
			}
		  });
		// Log.log("AutoCode 没有配置auth用户名字，最好配置下 ctr+shift+p 输入  Egret AutoCode 打开用户配置 设置auth的值");
	}
	//自动生成代码
	let disposable1 = vscode.commands.registerCommand('egretautocodeeui.egretautocodeeui', () => {
		let curFilePath = vscode.window.activeTextEditor?vscode.window.activeTextEditor.document.fileName:"";
		if(curFilePath)
		{
			EgretAutoCodeEui.parse(curFilePath);
		}else{
			Log.alert("EgretEuiAutoCode 当前没有打开的文件");
		}
	});
	//打开生成代码的配置
	let disposable2 = vscode.commands.registerCommand('egretautocodeeui.egretautocodeconfig', () => {
		let doc = vscode.workspace.openTextDocument(AppData.userConfig.autoCodeConfigPath);
		doc.then((dic)=>{
			vscode.window.showTextDocument(dic);
		});
	});
	//打开用户信息的配置
	let disposable3 = vscode.commands.registerCommand('egretautocodeeui.egretautocodeuserconfig', () => {
		let doc = vscode.workspace.openTextDocument(AppData.userConfigPath);
		doc.then((dic)=>{
			vscode.window.showTextDocument(dic);
		});
	});
	//刷新配置
	let disposable4 = vscode.commands.registerCommand('egretautocodeeui.egretautocoderefushconfig', () => {
		AppData.refushConfig();
	});
	//打开模板文件
	let disposable5 = vscode.commands.registerCommand('egretautocodeeui.egretautocodetemplate', () => {
		Log.alert("准备打开："+AppData.userConfig.templetePath);
		exec('explorer.exe '+AppData.userConfig.templetePath);
	});
	//实时生成文件
	let disposable6 = vscode.commands.registerCommand('egretautocodeeui.egretautocodewatch', () => {
		let curFilePath = vscode.window.activeTextEditor?vscode.window.activeTextEditor.document.fileName:"";
		if(curFilePath)
		{
			EgretAutoCodeEui.watchFile(curFilePath);
		}else{
			Log.alert("EgretEuiAutoCode 当前没有打开的文件");
		}
		
	});
	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable5);
	context.subscriptions.push(disposable6);
}

// this method is called when your extension is deactivated
export function deactivate() { Log.alert("EgretEuiAutoCode 组件失效");}
//输出到控制台上
// const opc = vscode.window.createOutputChannel('autoCodeOut'); // 可以有多个OutputChannel共存，使用参数名区分
// opc.clear(); // 清空
// let logFun = console.log;
// console.log = function(message?: any, ...optionalParams: any[])
// {
// 	opc.appendLine(message); // 追加一行
// 	opc.show();
// 	logFun(message, ...optionalParams);
// };
