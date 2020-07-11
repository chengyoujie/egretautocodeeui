// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { EgretAutoCodeEui } from './code/EgretAutoCodeEui';
import { AppData } from './AppData';
import { Log } from './tools/Log';
import {exec} from "child_process";
/**
 * 组件激活的时
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

	
	console.log('"egretautocodeeui" is now active!');
	if(!AppData.userConfig.auth)
	{
		Log.log("AutoCode 没有配置auth用户名字，最好配置下 ctr+shift+p 输入  Egret AutoCode 打开用户配置 设置auth的值");
	}
	//自动生成代码
	let disposable1 = vscode.commands.registerCommand('egretautocodeeui.egretautocodeeui', () => {
		let curFilePath = vscode.window.activeTextEditor?vscode.window.activeTextEditor.document.fileName:"";
		if(curFilePath)
		{
			EgretAutoCodeEui.parse(curFilePath);
		}else{
			Log.log("EgretEuiAutoCode 当前没有打开的文件");
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
		Log.log("准备打开："+AppData.userConfig.templetePath);
		exec('explorer.exe '+AppData.userConfig.templetePath);
	});
	context.subscriptions.push(disposable1);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
	context.subscriptions.push(disposable4);
	context.subscriptions.push(disposable5);
}

// this method is called when your extension is deactivated
export function deactivate() { Log.log("EgretEuiAutoCode 组件失效");}
