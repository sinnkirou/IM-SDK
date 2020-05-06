import IMClientManager, { WSOptions } from '../src/index';
import WS from "jest-websocket-mock";
import uuid from 'uuid/v1';

const wsUrl = "ws://localhost:1234";
let server = null;

describe('Common messages', () => {

    afterEach(() => {
        IMClientManager.getInstance().release();
        WS.clean();
    });

    test('Send Common Message without login', async () => {
        const fp = uuid();
        server = new WS(wsUrl);
        const messageQoSCB = {
            messagesBeReceivedCB: (fingerPrint: string) => {
                expect(fingerPrint).toEqual(fp);
            }
        };
        const chatTransDataCB = {
            onTransErrorCB: (params) => {
                expect(params).toEqual({ "errorCode": 301, "errorMsg": "{\"bridge\":false,\"type\":2,\"dataContent\":\"sss\",\"to\":\"5\",\"fp\":\"f7ebead0-8f3a-11ea-a183-5f898b4edcda\",\"Qos\":true,\"typeu\":0,\"sendTs\":0}" });
            }
        }
        const options: WSOptions = {
            wsUrl,
            messageQoSCB,
            chatTransDataCB
        }
        IMClientManager.getInstance(options);
        await server.connected;

        IMClientManager.getInstance().login({
            loginUserId: '1',
            loginToken: 'token',
            app: '123',
            callBack: (code) => {
                expect(code).toEqual(0);
                server.send(JSON.stringify({ "bridge": false, "type": 52, "dataContent": "{\"errorCode\":301,\"errorMsg\":\"{\\\"bridge\\\":false,\\\"type\\\":2,\\\"dataContent\\\":\\\"sss\\\",\\\"to\\\":\\\"5\\\",\\\"fp\\\":\\\"f7ebead0-8f3a-11ea-a183-5f898b4edcda\\\",\\\"Qos\\\":true,\\\"typeu\\\":0,\\\"sendTs\\\":0}\"}", "from": "0", "to": "-1", "Qos": false, "typeu": -1, "sendTs": -1 }));
            },
        })
        await expect(server).toReceiveMessage(`{\"bridge\":false,\"type\":0,\"dataContent\":\"{\\\"loginUserId\\\":\\\"1\\\",\\\"loginToken\\\":\\\"token\\\",\\\"extra\\\":null,\\\"app\\\":\\\"123\\\"}\",\"from\":\"1\",\"to\":\"0\",\"fp\":null,\"Qos\":false,\"typeu\":-1,\"retryCount\":0}`);
    });
})
