import AutoReLoginDaemon from './AutoReLoginDaemon';
import LocalWSDataReciever from './LocalWSDataReciever';
import LocalWSProvider from './LocalWSProvider';
import QoS4SendDaemon from './QoS4SendDaemon';
import QoS4ReciveDaemon from './QoS4ReciveDaemon';
import KeepAliveDaemon from './KeepAliveDaemon';
import ChatBaseEvent from '../events/inteface/IChatBaseEvent';
import ChatTransDataEvent from '../events/inteface/IChatTransDataEvent';
import MessageQoSEvent from '../events/inteface/IMessageQoSEvent';
import Logger from '../utils/Logger';

export default class ClientCoreSDK {
    private static TAG: string = ClientCoreSDK.name;
    public static DEBUG: boolean = true;
    public static autoReLogin: boolean = true;
    private static RESTART_DELAY_TIME_OUT: number = 1000;
    private static instance: ClientCoreSDK = null;
    private init: boolean = false;
    private localDeviceNetworkOk: boolean = true;
    private connectedToServer: boolean = true;
    private loginHasInit: boolean = false;
    private currentLoginUserId: string = null;
    private currentLoginToken: string = null;
    private app: string = null;
    private currentLoginExtra: string = null;
    private chatBaseEvent: ChatBaseEvent = null;
    private chatTransDataEvent: ChatTransDataEvent = null;
    private messageQoSEvent: MessageQoSEvent = null;
    private networkConnectionStatusBroadcastReceiver: EventListenerOrEventListenerObject = (e) => {
        const { type } = e;
        if (type === 'offline') {
            Logger.error(ClientCoreSDK.TAG, "【IMCORE】【本地网络通知】检测本地网络连接断开了!");
            this.localDeviceNetworkOk = false;
            // this.release();
            if (this.getChatBaseEvent() != null) {
                this.getChatBaseEvent().onLinkCloseMessage(-9999);
            }
        } else {
            if (ClientCoreSDK.DEBUG) {
                Logger.error(ClientCoreSDK.TAG, "【IMCORE】【本地网络通知】检测本地网络已连接上了!");
            }
            this.localDeviceNetworkOk = true;
            this.restart();
        }
    };
    private wsUrl: string = null;
    private wsProtocal?: string = null;

    public static getInstance(): ClientCoreSDK {
        if (ClientCoreSDK.instance == null) {
            ClientCoreSDK.instance = new ClientCoreSDK();
        }

        return ClientCoreSDK.instance;
    }

    public initialize(wsUrl: string, wsProtocal?: string, uni?: Uni): void {
        if (!this.init) {
            if(ClientCoreSDK.DEBUG) {
                Logger.debug(ClientCoreSDK.TAG, '【IMCORE】IM Client初始化');
            }
            LocalWSProvider.getInstance(wsUrl, wsProtocal, uni);
            this.registerReceiver(this.networkConnectionStatusBroadcastReceiver);
            AutoReLoginDaemon.getInstance();
            KeepAliveDaemon.getInstance();
            LocalWSDataReciever.getInstance();
            QoS4ReciveDaemon.getInstance();
            QoS4SendDaemon.getInstance();
            this.init = true;
            this.wsUrl = wsUrl;
            this.wsProtocal = wsProtocal;
        }
    }

    public restart(): void {
        this.release();
        setTimeout(()=>{
            if(ClientCoreSDK.DEBUG) {
                Logger.debug(ClientCoreSDK.TAG, '【IMCORE】IM Client正在重启', {
                    init: this.init,
                    wsUrl: this.wsUrl,
                    wsProtocal: this.wsProtocal
                })
            }
            if (!this.init && this.wsUrl) {
                LocalWSProvider.getInstance(this.wsUrl, this.wsProtocal);
                this.registerReceiver(this.networkConnectionStatusBroadcastReceiver);
                AutoReLoginDaemon.getInstance(true);
                KeepAliveDaemon.getInstance(true);
                LocalWSDataReciever.getInstance(true);
                QoS4ReciveDaemon.getInstance(true);
                QoS4SendDaemon.getInstance(true);
                this.init = true;
            }
        }, ClientCoreSDK.RESTART_DELAY_TIME_OUT);
        setTimeout(()=>{
            if(ClientCoreSDK.DEBUG) {
                Logger.debug(ClientCoreSDK.TAG, '【IMCORE】IM Client重启完成，正在重新登陆',)
            }
            AutoReLoginDaemon.getInstance().start(true);
        }, ClientCoreSDK.RESTART_DELAY_TIME_OUT + 1000);
    }

    public release(): void {
        // setTimeout(() => {
        //     LocalWSProvider.getInstance().closeLocalWebSocket();
        // }, 500);
        AutoReLoginDaemon.getInstance().stop();
        QoS4SendDaemon.getInstance().stop();
        KeepAliveDaemon.getInstance().stop();
        LocalWSDataReciever.getInstance().stop();
        QoS4ReciveDaemon.getInstance().stop();
        QoS4SendDaemon.getInstance().clear();
        QoS4ReciveDaemon.getInstance().clear();
        LocalWSProvider.getInstance().closeLocalWebSocket();

        try {
            this.unregisterReceiver(this.networkConnectionStatusBroadcastReceiver);
        } catch {
            Logger.info(ClientCoreSDK.TAG, "还未注册网络事件广播的监听器，本次取消注册已被正常忽略哦.");
        }

        this.init = false;
        this.setLoginHasInit(false);
        this.setConnectedToServer(false);
    }

    public getCurrentLoginUserId(): string {
        return this.currentLoginUserId;
    }

    public setCurrentLoginUserId(currentLoginUserId: string): ClientCoreSDK {
        this.currentLoginUserId = currentLoginUserId;
        return this;
    }

    public getCurrentLoginToken(): string {
        return this.currentLoginToken;
    }

    public setCurrentLoginToken(currentLoginToken: string): void {
        this.currentLoginToken = currentLoginToken;
    }

    public getApp(): string {
        return this.app;
    }

    public setApp(app: string): string {
        this.app = app;
        return this.app;
    }

    public getCurrentLoginExtra(): string {
        return this.currentLoginExtra;
    }

    public setCurrentLoginExtra(currentLoginExtra: string): ClientCoreSDK {
        this.currentLoginExtra = currentLoginExtra;
        return this;
    }

    public isLoginHasInit(): boolean {
        return this.loginHasInit;
    }

    public setLoginHasInit(loginHasInit: boolean): ClientCoreSDK {
        this.loginHasInit = loginHasInit;
        return this;
    }

    public isConnectedToServer(): boolean {
        return this.connectedToServer;
    }

    public setConnectedToServer(connectedToServer: boolean): void {
        this.connectedToServer = connectedToServer;
    }

    public isInitialized(): boolean {
        return this.init;
    }

    public isLocalDeviceNetworkOk(): boolean {
        return this.localDeviceNetworkOk;
    }

    public setChatBaseEvent(chatBaseEvent: ChatBaseEvent): void {
        this.chatBaseEvent = chatBaseEvent;
    }

    public getChatBaseEvent(): ChatBaseEvent {
        return this.chatBaseEvent;
    }

    public setChatTransDataEvent(chatTransDataEvent: ChatTransDataEvent): void {
        this.chatTransDataEvent = chatTransDataEvent;
    }

    public getChatTransDataEvent(): ChatTransDataEvent {
        return this.chatTransDataEvent;
    }

    public setMessageQoSEvent(messageQoSEvent: MessageQoSEvent): void {
        this.messageQoSEvent = messageQoSEvent;
    }

    public getMessageQoSEvent(): MessageQoSEvent {
        return this.messageQoSEvent;
    }

    private registerReceiver(networkConnectionStatusBroadcastReceiver: EventListenerOrEventListenerObject): void {
        let localWSSocket: WebSocket|SocketTask = LocalWSProvider.getInstance().getLocalWebSocket();
        localWSSocket.onerror = (event) => {
            Logger.error(ClientCoreSDK.TAG, 'WS检测到异常', null, event);
        }
        window.addEventListener("online", networkConnectionStatusBroadcastReceiver);
        window.addEventListener("offline", networkConnectionStatusBroadcastReceiver);
    }

    private unregisterReceiver(networkConnectionStatusBroadcastReceiver: EventListenerOrEventListenerObject): void {
        let localWSSocket: WebSocket|SocketTask = LocalWSProvider.getInstance().getLocalWebSocket();
        if(localWSSocket)
            localWSSocket.onerror = null;
        window.removeEventListener("online", networkConnectionStatusBroadcastReceiver);
        window.removeEventListener("offline", networkConnectionStatusBroadcastReceiver);
    }
}