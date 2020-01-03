export interface ChatBaseCB {
    onLoginOrReloginSuccessCB?: () => void,
    onLoginOrReloginFailCB?: () => void,
    onLinkCloseMessageCB?: () => void
}

export interface ChatTransDataCB {
    onTransBufferCB?: (params: object) => void,
    onTransErrorCB?: (params: object) => void
}

export interface MessageQoSCB {
    handleMessageLost?: (messages: Array<object>) => void,
    messagesBeReceivedCB?: (fingerPrint: string) => void
}

export interface WSOptions {
    wsUrl: string,
    wsProtocal?: string,
    chatBaseCB?: ChatBaseCB,
    chatTransDataCB?: ChatTransDataCB,
    messageQoSCB?: MessageQoSCB,
}