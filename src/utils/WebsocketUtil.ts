export default class WebsocketUtil {
    private static TAG: string = "WebsocketUtil";

    constructor() {
    }

    public static send(skt: WebSocket, data: string): boolean {
        if (skt != null && data != null) {
            try {
                if (skt.readyState === skt.OPEN) {
                    skt.send(data);
                    return true;
                }
            } catch (var4) {
                console.error(WebsocketUtil.TAG, "【IMCORE】send方法中》》发送WS数据报文时出错了：readyState=" + skt.readyState + ", 原因是：" + var4.getMessage(), var4);
                return false;
            }
        }
        console.error(WebsocketUtil.TAG, "【IMCORE】send方法中》》无效的参数：skt=" + skt);
        return false;
    }
}
