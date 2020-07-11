export class DateUtils{

    public static getDateStr(format:string ="yyyy-MM-dd hh:mm:ss")
    {
        let date = new Date();
        // let year = date.getFullYear();
        // let month = date.getMonth()+1;
        // let day = date.getDate();
        // let hours = date.getHours();
        // let minutes = date.getMinutes();
        // let seconds = date.getSeconds();
        var dateReg = {
            "M+": date.getMonth() + 1,
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3),
            "S+": date.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in dateReg) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1
                            ? dateReg[k] : ("00" + dateReg[k]).substr(("" + dateReg[k]).length));
                }
        }
        return format;
    }
}