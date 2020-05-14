import IMClientManager, { WSOptions } from '../src/index';

const wsUrl = "ws://localhost:1234";

test('Get instance without options', ()=> {
    expect(IMClientManager.getInstance).toThrow(new Error("wsURL 参数不可为空"));
});

test('Get instance with options', ()=> {
    const options: WSOptions = { wsUrl };
    expect(IMClientManager.getInitFlag()).toBeFalsy;

    expect(IMClientManager.getInstance(options)).toEqual(IMClientManager.getInstance());
    expect(IMClientManager.getInitFlag()).toBeTruthy;
    IMClientManager.getInstance().release();
});

test('Release', ()=> {
    const options: WSOptions = { wsUrl };
    IMClientManager.getInstance(options);
    expect(IMClientManager.getInitFlag()).toBeTruthy;

    IMClientManager.getInstance().release();
    expect(IMClientManager.getInitFlag()).toBeFalsy;
});

test('ResetInitFlag', ()=> {
    const options: WSOptions = { wsUrl };
    IMClientManager.getInstance(options);
    
    expect(IMClientManager.getInitFlag()).toBeTruthy;
    IMClientManager.getInstance().resetInitFlag();
    expect(IMClientManager.getInitFlag()).toBeFalsy;
})

test('DataListener', ()=> {
    const chatBaseCB = {
        onLoginOrReloginSuccessCB: () => {},
        onLoginOrReloginFailCB: () => {},
        onLinkCloseMessageCB: () => {},
    };
    const chatTransDataCB = {
        onTransBufferCB: (params) => {},
        onTransErrorCB: (params) => {},
    };
    const messageQoSCB = {
        handleMessageLost: (messages) => {},
        messagesBeReceivedCB: (fingerPrint: string) => {}
    }; 
    const options: WSOptions = { wsUrl, chatBaseCB, chatTransDataCB, messageQoSCB, };
    IMClientManager.getInstance(options);
    expect(IMClientManager.getInstance().getBaseEventListener()).toEqual(chatBaseCB);
    expect(IMClientManager.getInstance().getMessageQoSListener()).toEqual(messageQoSCB);
    expect(IMClientManager.getInstance().getTransDataListener()).toEqual(chatTransDataCB);
    IMClientManager.getInstance().release();
});
