namespace game {
    /**
     * AutoCodeEui 生成的界面 
     * euiPath:resource\skin\test\TestPanelSkin.exml  
     * made by cyj
     * create on 2021-12-10 11:41:49 
    */
    export class TestPanelView extends eui.Component {

        constructor(){
            super();
            this.skinName = 'TestPanelSkin';
        }

        /**界面创建成功**/
        protected childrenCreated() {
            super.childrenCreated();
            
			this.btnSuper.addEventListener(egret.TouchEvent.TOUCH_TAP, this.handleClkSuper, this)
        }

        
		//btnSuper点击事件处理
		private handleClkSuper(){
		
		}
		

        /**界面销毁**/
        public destroy(): void {
            
        }
    }
}
