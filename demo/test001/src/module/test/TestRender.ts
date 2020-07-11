namespace byh {
    /**
     * AutoCodeEui 生成的界面 
     * euiPath:resource\skin\test\TestRenderSkin.exml  
     * made by PC-202006022034
     * create on 2020-07-11 13:34:41 
    */
    export class TestRender extends eui.ItemRenderer {
    
        constructor() {
            super();
        }
        
        /** 数据发生改变 */
        public dataChanged(): void {
            super.dataChanged();
            this.lbl_des.text = "测试Render"+this.data;
        }
    }
}

    