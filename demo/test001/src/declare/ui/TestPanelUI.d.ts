declare namespace byh {
    /**
     * AutoCodeEui 生成的界面 
     * euiPath:resource\skin\test\TestPanelSkin.exml  
     * made by cyj
     * create on 2021-01-14 21:26:45 
    */
    export interface TestPanelView {
        btnSuper:eui.Button;
		list:eui.List;
		title:eui.Label;
		
    }
}
//模板文件位置：d:\nodejs\autocode\egretautocodeeui\demo\test001\template\autocode
//模板内所有变量对应的值
${varDes}=`所有的变量描述，方便编写模板时查看变量对应的内容`
${initEvent} = `
			this.btnSuper.addEventListener(egret.TouchEvent.TOUCH_TAP, this.handleClkSuper, this)`
//////////////////////////////////////////////
${eventFunction} = `
		/**btnSuper点击事件处理**/
		private handleClkSuper(){
		
		}
		`
//////////////////////////////////////////////
${fileName} = `TestPanelSkin`
//////////////////////////////////////////////
${auth} = `cyj`
//////////////////////////////////////////////
${skinPath} = `d:\nodejs\autocode\egretautocodeeui\demo\test001\resource\skin\test\TestPanelSkin.exml`
//////////////////////////////////////////////
${shortSkinPath} = `resource\skin\test\TestPanelSkin.exml`
//////////////////////////////////////////////
${time} = `2021-01-14 21:26:45`
//////////////////////////////////////////////
${skinName} = `TestPanelSkin`
//////////////////////////////////////////////
${baseClsName} = `TestPanel`
//////////////////////////////////////////////
${parentDir} = `test`
//////////////////////////////////////////////
${varids} = `public btnSuper:eui.Button;
		public list:eui.List;
		public title:eui.Label;
		`
//////////////////////////////////////////////
${interfaceIds} = `btnSuper:eui.Button;
		list:eui.List;
		title:eui.Label;
		`
//////////////////////////////////////////////
${shortName} = `TestPanel`
//////////////////////////////////////////////
${moduleID} = `TEST_PANEL`
//////////////////////////////////////////////

