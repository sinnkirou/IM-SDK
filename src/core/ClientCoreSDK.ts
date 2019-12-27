import AutoReLoginDaemon from './AutoReLoginDaemon';
import LocalWSDataReciever from './LocalWSDataReciever';
import LocalWSProvider from './LocalWSProvider';
import QoS4SendDaemon from './QoS4SendDaemon';
import QoS4ReciveDaemon from './QoS4ReciveDaemon';
import KeepAliveDaemon from './KeepAliveDaemon';
import ChatBaseEvent from '../events/inteface/IChatBaseEvent';
import ChatTransDataEvent from '../events/inteface/IChatTransDataEvent';
import MessageQoSEvent from '../events/inteface/IMessageQoSEvent';

export default class ClientCoreSDK {
    private static TAG: string = 'ClientCoreSDK';
    public static DEBUG: boolean = true;
    public static autoReLogin: boolean = true;
    private static instance: ClientCoreSDK = null;
    private _init: boolean = false;
    private localDeviceNetworkOk: boolean = true;
    private connectedToServer: boolean = true;
    private loginHasInit: boolean = false;
    private currentLoginUserId: string = null;
    private currentLoginToken: string = null;
    private currentLoginExtra: string = null;
    private chatBaseEvent: ChatBaseEvent = null;
    private chatTransDataEvent: ChatTransDataEvent = null;
    private messageQoSEvent: MessageQoSEvent = null;
    // private Context context = null;
    // private final BroadcastReceiver networkConnectionStatusBroadcastReceiver = new BroadcastReceiver() {
    //     public void onReceive(Context context, Intent intent) {
    //         ConnectivityManager connectMgr = (ConnectivityManager)context.getSystemService("connectivity");
    //         NetworkInfo mobNetInfo = connectMgr.getNetworkInfo(0);
    //         NetworkInfo wifiNetInfo = connectMgr.getNetworkInfo(1);
    //         NetworkInfo ethernetInfo = connectMgr.getNetworkInfo(9);
    //         if ((mobNetInfo == null || !mobNetInfo.isConnected()) && (wifiNetInfo == null || !wifiNetInfo.isConnected()) && (ethernetInfo == null || !ethernetInfo.isConnected())) {
    //             Log.e(ClientCoreSDK.TAG, "【IMCORE】【本地网络通知】检测本地网络连接断开了!");
    //             ClientCoreSDK.this.localDeviceNetworkOk = false;
    //             LocalWSProvider.getInstance().closeLocalWSSocket();
    //         } else {
    //             if (ClientCoreSDK.DEBUG) {
    //                 Log.e(ClientCoreSDK.TAG, "【IMCORE】【本地网络通知】检测本地网络已连接上了!");
    //             }

    //             ClientCoreSDK.this.localDeviceNetworkOk = true;
    //             LocalWSProvider.getInstance().closeLocalWSSocket();
    //         }

    //     }
    // };

    public static getInstance(): ClientCoreSDK {
        if (ClientCoreSDK.instance == null) {
            ClientCoreSDK.instance = new ClientCoreSDK();
        }

        return ClientCoreSDK.instance;
    }

    public init(wsUrl: string, wsProtocal?: string):void {
        if (!this._init) {
            LocalWSProvider.getInstance(wsUrl, wsProtocal);
            // this.context.registerReceiver(this.networkConnectionStatusBroadcastReceiver, intentFilter);
            AutoReLoginDaemon.getInstance();
            KeepAliveDaemon.getInstance();
            LocalWSDataReciever.getInstance();
            QoS4ReciveDaemon.getInstance();
            QoS4SendDaemon.getInstance();
            this._init = true;
        }

    }

    public release(): void {
        LocalWSProvider.getInstance().closeLocalWebSocket();
        AutoReLoginDaemon.getInstance().stop();
        QoS4SendDaemon.getInstance().stop();
        KeepAliveDaemon.getInstance().stop();
        LocalWSDataReciever.getInstance().stop();
        QoS4ReciveDaemon.getInstance().stop();
        QoS4SendDaemon.getInstance().clear();
        QoS4ReciveDaemon.getInstance().clear();

        try {
            // this.context.unregisterReceiver(this.networkConnectionStatusBroadcastReceiver);
        } catch {
            console.log(ClientCoreSDK.TAG, "还未注册android网络事件广播的监听器，本次取消注册已被正常忽略哦.");
        }

        this._init = false;
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

    public isInitialed(): boolean {
        return this._init;
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

    public setChatTransDataEvent( chatTransDataEvent: ChatTransDataEvent): void {
        this.chatTransDataEvent = chatTransDataEvent;
    }

    public  getChatTransDataEvent(): ChatTransDataEvent {
        return this.chatTransDataEvent;
    }

    public setMessageQoSEvent( messageQoSEvent: MessageQoSEvent):void {
        this.messageQoSEvent = messageQoSEvent;
    }

    public  getMessageQoSEvent():MessageQoSEvent {
        return this.messageQoSEvent;
    }
}