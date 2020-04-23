import ClientCoreSDK from './ClientCoreSDK';
import LocalWSProvider from './LocalWSProvider';
import Protocal from '../base/Protocal';
import ProtocalFactory from '../base/ProtocalFactory';
import QoS4ReciveDaemon from './QoS4ReciveDaemon';
import QoS4SendDaemon from './QoS4SendDaemon';
import KeepAliveDaemon from './KeepAliveDaemon';
import AutoReLoginDaemon from './AutoReLoginDaemon';
import { SendCommonDataAsync } from './LocalWSDataSender';
import Logger from '../utils/Logger';

export default class LocalWSDataReciever {
    static TAG: string = LocalWSDataReciever.name;
    private static instance: LocalWSDataReciever = null;
    private messageHandler: MessageHandler = null;
    private init: boolean = false;

    public static getInstance(reset: boolean= false): LocalWSDataReciever {
        if (LocalWSDataReciever.instance == null || reset) {
            LocalWSDataReciever.instance = new LocalWSDataReciever();
        }

        return LocalWSDataReciever.instance;
    }

    private constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (!this.init) {
            this.messageHandler = new MessageHandler();
            this.init = true;
        }
    }

    public stop(): void {
        let localWSSocket: WebSocket = LocalWSProvider.getInstance().getLocalWebSocket();
        if(localWSSocket) {
            localWSSocket.onerror = null;
        }
        this.init = false;
    }

    public startup(): void {
        this.stop();

        try {
            if (ClientCoreSDK.DEBUG) {
                Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】本地WS端口侦听中，" + "...");
            }

            this.wsListeningImpl();

        } catch (var2) {
            Logger.warn(LocalWSDataReciever.TAG, "【IMCORE】本地WSSocket监听开启时发生异常," + var2.getMessage(), var2);
        }

    }

    public isInitialized(): boolean {
        return this.init;
    }

    private wsListeningImpl(): void {
        let localWSSocket: WebSocket = LocalWSProvider.getInstance().getLocalWebSocket();
        if (localWSSocket != null && localWSSocket.readyState === localWSSocket.OPEN) {
            localWSSocket.onmessage =  (event)=> {
                this.messageHandler.handleMessage(event);
            }
        }
    }
}


export class MessageHandler {

    public handleMessage(event): void {
        if (typeof event.data === 'string') {
            try {
                let pFromServer: Protocal = new Protocal(JSON.parse(event.data));
                if (pFromServer.isQoS()) {
                    if (pFromServer.getType() == 50 && ProtocalFactory.parsePLoginInfoResponse(pFromServer.getDataContent()).getCode() != 0) {
                        if (ClientCoreSDK.DEBUG) {
                            Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】【BugFIX】这是服务端的登陆返回响应包，且服务端判定登陆失败(即code!=0)，本次无需发送ACK应答包！");
                        }
                    } else {
                        // if (QoS4ReciveDaemon.getInstance().hasRecieved(pFromServer.getFp())) {
                        //     if (ClientCoreSDK.DEBUG) {
                        //         Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】【QoS机制】" + pFromServer.getFp() + "已经存在于发送列表中，这是重复包，通知应用层收到该包罗！");
                        //     }

                        //     QoS4ReciveDaemon.getInstance().addRecieved(pFromServer);
                        //     this.sendRecievedBack(pFromServer);
                        //     return;
                        // }

                        if( pFromServer.getType() !== 2) {
                            QoS4ReciveDaemon.getInstance().addRecieved(pFromServer);
                        }
                        this.sendRecievedBack(pFromServer);
                    }
                }

                if (ClientCoreSDK.DEBUG) {
                    Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】收到服务端返回响应包: ", pFromServer);
                }
                switch (pFromServer.getType()) {
                    case 2:
                        if (ClientCoreSDK.getInstance().getChatTransDataEvent() != null && !QoS4ReciveDaemon.getInstance().hasRecieved(pFromServer.getFp())) {
                            ClientCoreSDK.getInstance().getChatTransDataEvent().onTransBuffer(pFromServer);
                        }
                        QoS4ReciveDaemon.getInstance().addRecieved(pFromServer);
                        break;
                    case 4:
                    case 54:
                        let theFingerPrint: string = pFromServer.getDataContent();
                        if (ClientCoreSDK.DEBUG) {
                            Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】【QoS】收到" + pFromServer.getFrom() + "发过来的指纹为" + theFingerPrint + "的应答包.");
                        }

                        if (ClientCoreSDK.getInstance().getMessageQoSEvent() != null) {
                            ClientCoreSDK.getInstance().getMessageQoSEvent().messagesBeReceived(theFingerPrint);
                        }

                        QoS4SendDaemon.getInstance().remove(theFingerPrint);
                        break;
                    case 50:
                        let loginInfoRes = ProtocalFactory.parsePLoginInfoResponse(pFromServer.getDataContent());
                        if (loginInfoRes.getCode() == 0) {
                            ClientCoreSDK.getInstance().setLoginHasInit(true);
                            AutoReLoginDaemon.getInstance().stop();
                            KeepAliveDaemon.getInstance().start(false);
                            QoS4SendDaemon.getInstance().startup(true);
                            QoS4ReciveDaemon.getInstance().startup(true);
                            ClientCoreSDK.getInstance().setConnectedToServer(true);
                        } else {
                            LocalWSDataReciever.getInstance().stop();
                            ClientCoreSDK.getInstance().setConnectedToServer(false);
                        }

                        if (ClientCoreSDK.getInstance().getChatBaseEvent() != null) {
                            ClientCoreSDK.getInstance().getChatBaseEvent().onLoginMessage(loginInfoRes.getCode());
                        }
                        break;
                    case 51:
                        if (ClientCoreSDK.DEBUG) {
                            Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】收到服务端回过来的Keep Alive心跳响应包.");
                        }

                        KeepAliveDaemon.getInstance().updateGetKeepAliveResponseFromServerTimstamp();
                        break;
                    case 52:
                        let errorRes = ProtocalFactory.parsePErrorResponse(pFromServer.getDataContent());
                        if (errorRes.getErrorCode() == 301) {
                            ClientCoreSDK.getInstance().setLoginHasInit(false);
                            Logger.error(LocalWSDataReciever.TAG, "【IMCORE】收到服务端的“尚未登陆”的错误消息，心跳线程将停止，请应用层重新登陆.");
                            KeepAliveDaemon.getInstance().stop();
                            AutoReLoginDaemon.getInstance().start(false);
                        }

                        if (ClientCoreSDK.getInstance().getChatTransDataEvent() != null) {
                            ClientCoreSDK.getInstance().getChatTransDataEvent().onErrorResponse(errorRes.getErrorCode(), errorRes.getErrorMsg());
                        }
                        break;
                    default:
                        Logger.warn(LocalWSDataReciever.TAG, "【IMCORE】收到的服务端消息类型：" + pFromServer.getType() + "，但目前该类型客户端不支持解析和处理！");
                }
            } catch (var5) {
                Logger.warn(LocalWSDataReciever.TAG, "【IMCORE】处理消息的过程中发生了错误.", var5);
            }

        }
    }

    private sendRecievedBack(pFromServer: Protocal): void {
        if (pFromServer.getFp() != null) {
            new SendCommonDataAsync(ProtocalFactory.createRecivedBack(pFromServer.getFrom(), pFromServer.getFp(), pFromServer.isBridge())).exceute(code => {
                if (ClientCoreSDK.DEBUG) {
                    Logger.debug(LocalWSDataReciever.TAG, "【IMCORE】【QoS】向" + pFromServer.getFrom() + "发送" + pFromServer.getFp() + "包的应答包成功,from=" + pFromServer.getTo() + "！");
                }
            })
        } else {
            Logger.warn(LocalWSDataReciever.TAG, "【IMCORE】【QoS】收到" + pFromServer.getFrom() + "发过来需要QoS的包，但它的指纹码却为null！无法发应答包！");
        }

    }
}