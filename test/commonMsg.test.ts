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

    test('Send Common Message with Qos enabled',  async ()=> {
        let acked = false;
        const fp = uuid();
        server = new WS(wsUrl);
        const messageQoSCB = {
            messagesBeReceivedCB: (fingerPrint: string) => {
                expect(fingerPrint).toEqual(fp);
                acked = true;
            }
        };
        const options: WSOptions = {
            wsUrl,
            messageQoSCB
        }
        IMClientManager.getInstance(options);
        await server.connected;

        IMClientManager.getInstance().login({
            logiUserId: '1',
            loginToken: 'token',
            app: 'appName',
            callBack: (code)=> {
                server.send(JSON.stringify({"bridge":false,"type":50,"dataContent":"{\"code\":0}","from":"0","to":"1","fp":"bf09e7b5-7be3-4121-a028-a91345356cce","Qos":false,"typeu":-1,"sendTs":-1}));
            }
        });
        await expect(server).toReceiveMessage("{\"bridge\":false,\"type\":0,\"dataContent\":\"{\\\"loginUserId\\\":\\\"1\\\",\\\"loginToken\\\":\\\"token\\\",\\\"extra\\\":null,\\\"app\\\":\\\"appName\\\"}\",\"from\":\"1\",\"to\":\"0\",\"fp\":null,\"Qos\":false,\"typeu\":-1,\"retryCount\":0}");
        IMClientManager.getInstance().send({
            toId: '2',
            fingerPrint: fp,
            dataContent: 'test',
            callBack: (code)=> {
                expect(code).toEqual(0);
                server.send(JSON.stringify({"bridge":false,"type":54,"dataContent":fp,"from":"0","to":"1","Qos":false,"typeu":-1,"sendTs":-1}))
            }
        })
        await expect(server).toReceiveMessage(`{\"bridge\":false,\"type\":2,\"dataContent\":\"test\",\"from\":\"1\",\"to\":\"2\",\"fp\":\"${fp}\",\"Qos\":true,\"typeu\":0,\"retryCount\":0}`);

        expect(acked).toEqual(true);
    });

    test('Send Common Message with Qos disabled',  async ()=> {
        let acked = false;
        const fp = uuid();
        server = new WS(wsUrl);
        const messageQoSCB = {
            messagesBeReceivedCB: (fingerPrint: string) => {
                expect(fingerPrint).toEqual(fp);
                acked = true;
            }
        };
        const options: WSOptions = {
            wsUrl,
            messageQoSCB
        }
        IMClientManager.getInstance(options);
        await server.connected;

        IMClientManager.getInstance().login({
            logiUserId: '1',
            loginToken: 'token',
            app: 'appName',
            callBack: (code)=> {
                server.send(JSON.stringify({"bridge":false,"type":50,"dataContent":"{\"code\":0}","from":"0","to":"1","fp":"bf09e7b5-7be3-4121-a028-a91345356cce","Qos":false,"typeu":-1,"sendTs":-1}));
            }
        });
        await expect(server).toReceiveMessage("{\"bridge\":false,\"type\":0,\"dataContent\":\"{\\\"loginUserId\\\":\\\"1\\\",\\\"loginToken\\\":\\\"token\\\",\\\"extra\\\":null,\\\"app\\\":\\\"appName\\\"}\",\"from\":\"1\",\"to\":\"0\",\"fp\":null,\"Qos\":false,\"typeu\":-1,\"retryCount\":0}");
        IMClientManager.getInstance().send({
            toId: '2',
            dataContent: 'test',
            fingerPrint: fp,
            callBack: (code)=> {
                expect(code).toEqual(0);
            },
            Qos: false
        })
        await expect(server).toReceiveMessage(`{\"bridge\":false,\"type\":2,\"dataContent\":\"test\",\"from\":\"1\",\"to\":\"2\",\"fp\":\"${fp}\",\"Qos\":false,\"typeu\":0,\"retryCount\":0}`);

        expect(acked).toEqual(false);
    });
})
