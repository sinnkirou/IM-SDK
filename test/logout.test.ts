import IMClientManager, { WSOptions } from '../src/index';
import WS from "jest-websocket-mock";

const wsUrl = "ws://localhost:1234";
let server = null;

describe('Logout messages', () => {

    afterEach(() => {
        IMClientManager.getInstance().release();
        WS.clean();
    });

    test('Logout', async () => {
        server = new WS(wsUrl);
        IMClientManager.getInstance({ wsUrl });
        await server.connected;

        IMClientManager.getInstance().login({
            loginUserId: '1',
            loginToken: 'token',
            app: 'appName',
            callBack: (code) => {
                server.send(JSON.stringify({ "bridge": false, "type": 50, "dataContent": "{\"code\":0}", "from": "0", "to": "1", "fp": "bf09e7b5-7be3-4121-a028-a91345356cce", "Qos": false, "typeu": -1, "sendTs": -1 }))
            }
        });
        await expect(server).toReceiveMessage("{\"bridge\":false,\"type\":0,\"dataContent\":\"{\\\"loginUserId\\\":\\\"1\\\",\\\"loginToken\\\":\\\"token\\\",\\\"extra\\\":null,\\\"app\\\":\\\"appName\\\"}\",\"from\":\"1\",\"to\":\"0\",\"fp\":null,\"Qos\":false,\"typeu\":-1,\"retryCount\":0}");

        IMClientManager.getInstance().logout((code) => {
            expect(code).toEqual(0);
        });
        await expect(server).toReceiveMessage("{\"bridge\":false,\"type\":3,\"dataContent\":\"\",\"from\":\"1\",\"to\":\"0\",\"fp\":null,\"Qos\":false,\"typeu\":-1,\"retryCount\":0}");
    });
});
