import Protocal from '../../base/Protocal';

export interface ChatBaseCB {
    onLoginOrReloginSuccessCB?: () => void,
    onLoginOrReloginFailCB?: () => void,
    onLinkCloseMessageCB?: () => void
}

export interface ChatTransDataCB {
    onTransBufferCB?: (msg: Protocal) => void,
    onTransErrorCB?: (params: object) => void
}

export interface MessageQoSCB {
    handleMessageLost?: (messages: Array<Protocal>) => void,
    messagesBeReceivedCB?: (fingerPrint: string) => void
}