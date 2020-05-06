import IMClientManager, { WSOptions } from '../src/index';
import WS from "jest-websocket-mock";
import uuid from 'uuid/v1';

const wsUrl = "ws://localhost:1234";
let server = null;

describe('Common messages', ()=> {
    
    afterEach(() => {
        IMClientManager.getInstance().logout();
        IMClientManager.getInstance().release();
        WS.clean();
    });

    test('Send Common Message received',  async ()=> {
        let received = false;
        const msgDataContent = 'msg reveiced';
        const fp = uuid();
        server = new WS(wsUrl);
        const chatTransDataCB = {
            onTransBufferCB: (msg) => {
                expect(msg.dataContent).toEqual(msgDataContent);
                expect(msg.from).toEqual("2");
                received = true;
            }
        };
        const options: WSOptions = {
            wsUrl,
            chatTransDataCB
        }
        IMClientManager.getInstance(options);
        await server.connected;

        IMClientManager.getInstance().login({
            loginUserId: '1',
            loginToken: 'token',
            app: 'appName',
            callBack: (code)=> {
                server.send(JSON.stringify({"bridge":false,"type":50,"dataContent":"{\"code\":0}","from":"0","to":"1","fp":"bf09e7b5-7be3-4121-a028-a91345356cce","Qos":false,"typeu":-1,"sendTs":-1}));
            }
        });
        await expect(server).toReceiveMessage("{\"bridge\":false,\"type\":0,\"dataContent\":\"{\\\"loginUserId\\\":\\\"1\\\",\\\"loginToken\\\":\\\"token\\\",\\\"extra\\\":null,\\\"app\\\":\\\"appName\\\"}\",\"from\":\"1\",\"to\":\"0\",\"fp\":null,\"Qos\":false,\"typeu\":-1,\"retryCount\":0,\"sendTs\":null}");

        server.send(JSON.stringify({"bridge":false,"type":2,"dataContent":msgDataContent,"from":"2","to":"1","Qos":false,"typeu":-1,"sendTs":-1}))
        expect(received).toEqual(true);
    });
})
