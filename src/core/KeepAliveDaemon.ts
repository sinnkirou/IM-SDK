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
    private static NETWORK_CONNECTION_TIME_OUT: number = 10000;
    private static KEEP_ALIVE_INTERVAL: number = 20000;
    private static RESTART_DELAY_TIME_OUT: number = 1000;
    private keepAliveRunning: boolean = false;
    private lastGetKeepAliveResponseFromServerTimstamp: number = 0;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(reset: boolean= false): KeepAliveDaemon {
        if (KeepAliveDaemon.instance == null || reset) {
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
                            const gap = now - this.lastGetKeepAliveResponseFromServerTimstamp;
                            if(ClientCoreSDK.DEBUG) {
                                Logger.debug(KeepAliveDaemon.TAG, '【IMCORE】心跳线程执行中...延迟为： ', gap)
                            }
                            if (
                                gap >=
                                KeepAliveDaemon.NETWORK_CONNECTION_TIME_OUT
                            ) {
                                // this.stop();
                                // LocalWSProvider.getInstance().closeLocalWebSocket();
                                // QoS4ReciveDaemon.getInstance().stop();
                                // ClientCoreSDK.getInstance().setConnectedToServer(false);
                                // ClientCoreSDK.getInstance().getChatBaseEvent().onLinkCloseMessage(-1);
                                // AutoReLoginDaemon.getInstance().start(true);

                                ClientCoreSDK.getInstance().release();
                                willStop = true;

                                setTimeout(()=>{
                                    if(ClientCoreSDK.DEBUG) {
                                        Logger.debug(KeepAliveDaemon.TAG, '【IMCORE】心跳线程判断超过限定延迟，正在重启',)
                                    }
                                    ClientCoreSDK.getInstance().restart();
                                }, KeepAliveDaemon.RESTART_DELAY_TIME_OUT);
                                setTimeout(()=>{
                                    if(ClientCoreSDK.DEBUG) {
                                        Logger.debug(KeepAliveDaemon.TAG, '【IMCORE】重启完成，正在重新登陆',)
                                    }
                                    AutoReLoginDaemon.getInstance().start(true);
                                }, KeepAliveDaemon.RESTART_DELAY_TIME_OUT + 1000);
                            }
                        }
                    }, 1000);

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
        this.init = false;
    }

    public start(immediately: boolean): void {
        this.reRunProcess.start(immediately);
        this.keepAliveRunning = true;
        if(ClientCoreSDK.DEBUG) {
            Logger.debug(KeepAliveDaemon.TAG, '【IMCORE】心跳线程将启动...是否立即执行', immediately);
        }
    }

    public isKeepAliveRunning(): boolean {
        return this.keepAliveRunning;
    }

    public isInitialized(): boolean {
        return this.init;
    }

    public updateGetKeepAliveResponseFromServerTimstamp(): void {
        this.lastGetKeepAliveResponseFromServerTimstamp = new Date().getTime();
    }
}
