import ClientCoreSDK from './ClientCoreSDK';
import Logger from '../utils/Logger';

export default class LocalWSProvider {
    private static TAG: string = LocalWSProvider.name;
    private static instance: LocalWSProvider = null;
    private localWebSocket: WebSocket|SocketTask = null;
    private wsUrl: string = null;
    private wsProtocal: string = null;
    private uni: Uni = null;

    public static getInstance(wsUrl?: string, wsProtocal?: string, uni?: Uni): LocalWSProvider {
        if (LocalWSProvider.instance == null) {
            if (!wsUrl) {
                throw new Error("localWebSocket未初始化");
            } else {
                LocalWSProvider.instance = new LocalWSProvider(wsUrl, wsProtocal, uni);
            }
        }

        return LocalWSProvider.instance;
    }

    constructor(wsUrl: string, wsProtocal?: string, uni?:Uni) {
        this.wsUrl = wsUrl;
        this.wsProtocal = wsProtocal;
        this.uni = uni;
        this.setLocalWebSocket(wsUrl, wsProtocal);
    }

    private setLocalWebSocket(wsUrl: string, wsProtocal?: string): WebSocket|SocketTask {
        if(this.uni) {
            this.localWebSocket = this.uni.connectSocket({
                url: wsUrl,
                complete: ()=> {}
            });
            this.localWebSocket.onclose = this.localWebSocket.onClose;
            this.localWebSocket.onerror = this.localWebSocket.onError;
            this.localWebSocket.onmessage = this.localWebSocket.onMessage;
            this.localWebSocket.onopen = this.localWebSocket.onOpen;
            this.localWebSocket.readyState = this.localWebSocket.OPEN;
        } else {
            this.localWebSocket = new WebSocket(wsUrl, wsProtocal);
        }
        return this.localWebSocket;
    }

    public resetLocalWebSocket(): WebSocket|SocketTask {
        try {
            this.closeLocalWebSocket();
            this.localWebSocket = this.setLocalWebSocket(this.wsUrl, this.wsProtocal);
            return this.localWebSocket;
        } catch (var2) {
            Logger.warn(LocalWSProvider.TAG, "【IMCORE】localWebSocket创建时出错，原因是：" + var2.getMessage(), var2);
            this.closeLocalWebSocket();
            return null;
        }
    }

    private isLocalWebSocketReady(): boolean {
        if(this.uni) {
            return this.localWebSocket != null;
        }
        return this.localWebSocket != null && (
            this.localWebSocket.readyState === this.localWebSocket.OPEN ||
            this.localWebSocket.readyState === this.localWebSocket.CONNECTING
        );
    }

    public isLocalWebSocketOpen(): boolean {
        return this.localWebSocket != null && (
            this.localWebSocket.readyState === this.localWebSocket.OPEN
        );
    }

    public getLocalWebSocket(): WebSocket|SocketTask {
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
                Logger.debug(LocalWSProvider.TAG, "【IMCORE】websocket处于未初化状态（可能是您还未登陆），无需关闭。");
            }
        } catch (var3) {
            if (!silent) {
                Logger.warn(LocalWSProvider.TAG, "【IMCORE】closeLocalWebSocket时出错，原因是：" + var3.getMessage(), var3);
            }
        }

    }

    public getURL(): string {
        // return this.localWebSocket.url;
        return this.wsUrl;
    }

    public send(data: string): boolean {
        const skt = this.localWebSocket;
        if (skt != null && data != null) {
            try {
                if (skt.readyState === skt.OPEN) {
                    skt.send(data);
                    return true;
                }
                Logger.error(LocalWSProvider.TAG, "【IMCORE】send方法中》》发送WS数据报文时出错了：readyState=" + skt.readyState + " 数据是", null, data);
                return false;
            } catch (var4) {
                Logger.error(LocalWSProvider.TAG, "【IMCORE】send方法中》》发送WS数据报文时出错了：readyState=" + skt.readyState + ", 原因是：" + var4.getMessage(), var4);
                return false;
            }
        }
        Logger.error(LocalWSProvider.TAG, "【IMCORE】send方法中》》无效的参数：skt=", null, skt);
        return false;
    }
}
