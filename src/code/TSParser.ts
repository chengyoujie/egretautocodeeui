
import * as vscode from 'vscode';
import { Log } from '../tools/Log';
import * as XMLParser from "./../tools/xml/index";

/**解析ts文件 */
export class TSParser{

    constructor()
    {
        let edit = vscode.window.activeTextEditor;
        if(edit)//选中协议并生成代码
        {
            if(edit.selection.isEmpty)
            {
                Log.log("当前没有选中内容");
            }else{
                edit.edit(editBuilder => {
                    const range = new vscode.Range(edit.selection.start, edit.selection.end);
                    let selectTxt = edit.document.getText(range);
                    let codeStr = "";
                    try{
                        let xmlObj = XMLParser.parse("<root>"+selectTxt+"</root>");
                        if(xmlObj.children)
                        {
                            for(let i=0; i<xmlObj.children.length; i++)
                            {
                                let item = xmlObj.children[i] as egret.XML;
                                if(!item.attributes && item.attributes.name)continue;
                                let type = item.attributes.type;
                                if(type == 1)//服务器发送给客户端的
                                {
                                    codeStr += `
        /**${item.attributes.des}**/
        private n_${item.attributes.id}(vo: S_${item.attributes.name}): void {
            let s = this;
            //TODO ${item.attributes.des}协议返回处理                                   
        }
        `;
                                }
                            }
                        }
                    }catch(e){
                        Log.log("当前选中的不是xml文本");
                    }
                    if(codeStr)
                    {
                        editBuilder.replace(range, codeStr);   
                        Log.log("xml替换为协议 转换成功");
                    }
                });
            }
        }else{
            Log.log("当前没有选中文本");
        }
    }
}