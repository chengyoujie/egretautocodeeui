namespace byh {
    /**
     * AutoCodeEui 生成的界面 
     * euiPath:resource\skin\test\TestPanelSkin.exml  
     * made by PC-202006022034
     * create on 2020-07-11 13:33:31 
    */
    export class TestPanelView extends eui.Component {

        constructor(){
            super();
            this.skinName = 'TestPanelSkin';
        }

        /**界面创建成功**/
        protected childrenCreated() {
            super.childrenCreated();
            this.title.text = "测试EgretAutoCode";
            this.list.itemRenderer = TestRender;
            this.list.dataProvider = new eui.ArrayCollection([1,2,3,4,5,6,7,8,9])
			this.btnSuper.addEventListener(egret.TouchEvent.TOUCH_TAP, this.handleClkSuper, this)
        }

        
		/**btnSuper点击事件处理**/
		private handleClkSuper(){
            if(this.parent)
            {
                this.parent.removeChild(this);
            }
		}
		

        /**界面销毁**/
        public destroy(): void {
            
        }
    }
}