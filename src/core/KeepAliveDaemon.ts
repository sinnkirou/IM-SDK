import ClientCoreSDK from './ClientCoreSDK';
import LocalWSDataSender from './LocalWSDataSender';
import LocalWSProvider from './LocalWSProvider';
import QoS4ReciveDaemon from './QoS4ReciveDaemon';
import AutoReLoginDaemon from './AutoReLoginDaemon';
import MockThread from '../utils/MockThread';
import Logger from '../utils/Logger';

export default class KeepAliveDaemon {
    private static TAG: string = KeepAliveDaemon.name;
    private static instance: KeepAliveDaemon = null;
    public static NETWORK_CONNECTION_TIME_OUT: number = 10000;
    public static KEEP_ALIVE_INTERVAL: number = 20000;
    private keepAliveRunning: boolean = false;
    private lastGetKeepAliveResponseFromServerTimstamp: number = 0;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(): KeepAliveDaemon {
        if (KeepAliveDaemon.instance == null) {
            KeepAliveDaemon.instance = new KeepAliveDaemon();
        }

        return KeepAliveDaemon.instance;
    }

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (!this.init) {
            let doInBackground = () => {
                let willStop: boolean = false;
                if (!willStop) {
                    if (ClientCoreSDK.DEBUG) {
                        Logger.info(KeepAliveDaemon.TAG, '【IMCORE】心跳线程执行中...');
                    }

                    let code: number = LocalWSDataSender.getInstance().sendKeepAlive();

                    let isInitialedForKeepAlive: boolean = this.lastGetKeepAliveResponseFromServerTimstamp == 0;
                    if (isInitialedForKeepAlive) {
                        this.lastGetKeepAliveResponseFromServerTimstamp = new Date().getTime();
                    }

                    setTimeout(() => {
                        if (!isInitialedForKeepAlive) {
                            let now = new Date().getTime();
                            if (
                                now - this.lastGetKeepAliveResponseFromServerTimstamp >=
                                KeepAliveDaemon.NETWORK_CONNECTION_TIME_OUT
                            ) {
                                this.stop();
                                LocalWSProvider.getInstance().closeLocalWebSocket();
                                QoS4ReciveDaemon.getInstance().stop();
                                ClientCoreSDK.getInstance().setConnectedToServer(false);
                                ClientCoreSDK.getInstance().getChatBaseEvent().onLinkCloseMessage(-1);
                                AutoReLoginDaemon.getInstance().start(true);
    
                                willStop = true;
                            }
                        }
                    }, KeepAliveDaemon.NETWORK_CONNECTION_TIME_OUT);

                }
            }
            this.reRunProcess = new MockThread(doInBackground, KeepAliveDaemon.KEEP_ALIVE_INTERVAL)
            this.init = true;
        }
    }

    public stop(): void {
        this.reRunProcess.stop();
        this.keepAliveRunning = false;
        this.lastGetKeepAliveResponseFromServerTimstamp = 0;
    }

    public start(immediately: boolean): void {
        this.reRunProcess.start(immediately);
        this.keepAliveRunning = true;
    }

    public isKeepAliveRunning(): boolean {
        return this.keepAliveRunning;
    }

    public isInit(): boolean {
        return this.init;
    }

    public updateGetKeepAliveResponseFromServerTimstamp(): void {
        this.lastGetKeepAliveResponseFromServerTimstamp = new Date().getTime();
    }
}
