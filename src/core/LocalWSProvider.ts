import ClientCoreSDK from './ClientCoreSDK';
import Logger from '../utils/Logger';

export default class LocalWSProvider {
    private static TAG: string = LocalWSProvider.name;
    private static instance: LocalWSProvider = null;
    private localWebSocket: WebSocket = null;
    private wsUrl: string = null;
    private wsProtocal: string = null;

    public static getInstance(wsUrl?: string, wsProtocal?: string): LocalWSProvider {
        if (LocalWSProvider.instance == null) {
            if (!wsUrl) {
                throw new Error("localWebSocket未初始化");
            } else {
                LocalWSProvider.instance = new LocalWSProvider(wsUrl, wsProtocal);
            }
        }

        return LocalWSProvider.instance;
    }

    constructor(wsUrl: string, wsProtocal?: string) {
        this.wsUrl = wsUrl;
        this.wsProtocal = wsProtocal;
        this.localWebSocket = new WebSocket(wsUrl, wsProtocal);
        // @ts-ignore
        // window.ws = this.localWebSocket;
    }

    public resetLocalWebSocket(): WebSocket {
        try {
            this.closeLocalWebSocket();
            this.localWebSocket = new WebSocket(this.wsUrl, this.wsProtocal);
            return this.localWebSocket;
        } catch (var2) {
            Logger.warn(LocalWSProvider.TAG, "【IMCORE】localWebSocket创建时出错，原因是：" + var2.getMessage(), var2);
            this.closeLocalWebSocket();
            return null;
        }
    }

    private isLocalWebSocketReady(): boolean {
        return this.localWebSocket != null && (
            this.localWebSocket.readyState === this.localWebSocket.OPEN ||
            this.localWebSocket.readyState === this.localWebSocket.CONNECTING
        );
    }

    public getLocalWebSocket(): WebSocket {
        return this.isLocalWebSocketReady() ? this.localWebSocket : this.resetLocalWebSocket();
    }

    public closeLocalWebSocket(silent: boolean = true): void {
        try {
            if (ClientCoreSDK.DEBUG && !silent) {
                Logger.debug(LocalWSProvider.TAG, "【IMCORE】正在closeLocalWebSocket()...");
            }

            if (this.localWebSocket != null && this.localWebSocket.readyState === this.localWebSocket.OPEN) {
                this.localWebSocket.close();
                this.localWebSocket = null;
            } else if (!silent) {
                Logger.debug(LocalWSProvider.TAG, "【IMCORE】Socket处于未初化状态（可能是您还未登陆），无需关闭。");
            }
        } catch (var3) {
            if (!silent) {
                Logger.warn(LocalWSProvider.TAG, "【IMCORE】closeLocalWebSocket时出错，原因是：" + var3.getMessage(), var3);
            }
        }

    }

    public getURL(): string {
        return this.localWebSocket.url;
    }
}
