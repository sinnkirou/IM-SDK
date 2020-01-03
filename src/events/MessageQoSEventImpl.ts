import Protocal from '../base/Protocal';
import IMessageQoSEvent from './inteface/IMessageQoSEvent';
import { MessageQoSCB } from './inteface/IEventCallBack';

export default class MessageQoSEventImpl implements IMessageQoSEvent {
    private static TAG: string = 'MessageQoSEventImpl';
    private handleMessageLost: (messages: Array<object>) => void = null;
    private messagesBeReceivedCB: (fingerPrint: string) => void = null;

    constructor(options?: MessageQoSCB) {
        const { handleMessageLost, messagesBeReceivedCB } = options
        this.handleMessageLost = handleMessageLost;
        this.messagesBeReceivedCB = messagesBeReceivedCB;
    }

    public messagesLost(lostMessages: Array<Protocal>): void {
        console.debug(MessageQoSEventImpl.TAG, "【DEBUG_UI】收到系统的未实时送达事件通知，当前共有" + lostMessages.length + "个包QoS保证机制结束，判定为【无法实时送达】！");
        if (this.handleMessageLost) {
            this.handleMessageLost(lostMessages);
        }
    }

    public messagesBeReceived(theFingerPrint: string): void {
        if (theFingerPrint != null) {
            console.debug(MessageQoSEventImpl.TAG, "【DEBUG_UI】收到对方已收到消息事件的通知，fp=" + theFingerPrint);
            if (this.messagesBeReceivedCB) {
                this.messagesBeReceivedCB(theFingerPrint);
            }
        }
    }

}
