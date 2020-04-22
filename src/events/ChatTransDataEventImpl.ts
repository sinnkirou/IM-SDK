import ErrorCode from '../base/ErrorCode';
import Protocal from '../base/Protocal';
import IChatTransDataEvent from './inteface/IChatTransDataEvent';
import { ChatTransDataCB, } from './inteface/IEventCallBack';
import Logger from '../utils/Logger';

export default class ChatTransDataEventImpl implements IChatTransDataEvent {
    private static TAG: string = ChatTransDataEventImpl.name;
    private onTransBufferCB: (params: object) => void = null;
    private onTransErrorCB: (params: object) => void = null;

    constructor(options?: ChatTransDataCB) {
        const { onTransBufferCB, onTransErrorCB } = options;
        this.onTransBufferCB = onTransBufferCB;
        this.onTransErrorCB = onTransErrorCB;
    }

    public onTransBuffer(p: Protocal): void {
        Logger.debug(ChatTransDataEventImpl.TAG, "【DEBUG_UI】[typeu=" + p.getTypeu() + "]收到来自用户" + p.getFrom() + "的消息:" + p.getDataContent());
        if (this.onTransBufferCB) {
            this.onTransBufferCB(p);
        }
    }

    public onErrorResponse(errorCode: number, errorMsg: string): void {
        Logger.debug(ChatTransDataEventImpl.TAG, "【DEBUG_UI】收到服务端错误消息，errorCode=" + errorCode + ", errorMsg=" + errorMsg);

        if (errorCode == ErrorCode.RESPONSE_FOR_UNLOGIN)
            Logger.debug(ChatTransDataEventImpl.TAG, "【DEBUG_UI】服务端会话已失效，自动登陆/重连将启动! (" + errorCode + ")");
        else
            Logger.debug(ChatTransDataEventImpl.TAG, "【DEBUG_UI】Server反馈错误码：" + errorCode + ",errorMsg=" + errorMsg);

        if (this.onTransErrorCB) {
            this.onTransErrorCB({ errorCode, errorMsg });
        }
    }
}
