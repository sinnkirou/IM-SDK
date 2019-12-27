import ErrorCode from '../base/ErrorCode';
import IChatTransDataEvent from './inteface/IChatTransDataEvent';

export default class ChatTransDataEventImpl implements IChatTransDataEvent {
    private static TAG: string = "ChatTransDataEventImpl";
    private onTransBufferCB: (params: object) => void = null;
    private onTransErrorCB: (params: object) => void = null;

    constructor(onTransBufferCB?: (params: object)=>void, onTransErrorCB?: (params: object)=> void){
        this.onTransBufferCB = onTransBufferCB;
        this.onTransErrorCB = onTransErrorCB;
    }

    public onTransBuffer(fingerPrintOfProtocal: string, userid: string, dataContent: string, typeu: number): void {
        console.debug(ChatTransDataEventImpl.TAG, "【DEBUG_UI】[typeu=" + typeu + "]收到来自用户" + userid + "的消息:" + dataContent);
        if (this.onTransBufferCB) {
            this.onTransBufferCB({ fingerPrintOfProtocal, userid, dataContent, typeu });
        }
    }

    public onErrorResponse(errorCode: number, errorMsg: string): void {
        console.debug(ChatTransDataEventImpl.TAG, "【DEBUG_UI】收到服务端错误消息，errorCode=" + errorCode + ", errorMsg=" + errorMsg);

        if (errorCode == ErrorCode.RESPONSE_FOR_UNLOGIN)
            console.debug("服务端会话已失效，自动登陆/重连将启动! (" + errorCode + ")");
        else
            console.debug("Server反馈错误码：" + errorCode + ",errorMsg=" + errorMsg);

        if (this.onTransErrorCB) {
            this.onTransErrorCB({ errorCode, errorMsg });
        }
    }
}
