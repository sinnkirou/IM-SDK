import ClientCoreSDK from './ClientCoreSDK';
import LocalWSDataSender from './LocalWSDataSender';
import MockThread from '../utils/MockThread';
import Logger from '../utils/Logger';

export default class KeepAliveDaemon {
    private static TAG: string = KeepAliveDaemon.name;
    private static instance: KeepAliveDaemon = null;
    private static NETWORK_CONNECTION_TIME_OUT: number = 10000;
    private static KEEP_ALIVE_INTERVAL: number = 20000;
    private keepAliveRunning: boolean = false;
    private lastGetKeepAliveResponseFromServerTimstamp: number = 0;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(reset: boolean = false): KeepAliveDaemon {
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
                    let code: number = LocalWSDataSender.getInstance().sendKeepAlive();
                    let now = new Date().getTime();
                    let isInitialedForKeepAlive: boolean = this.lastGetKeepAliveResponseFromServerTimstamp == 0;
                    if (isInitialedForKeepAlive) {
                        this.lastGetKeepAliveResponseFromServerTimstamp = new Date().getTime();
                    }

                    setTimeout(() => {
                        if (!isInitialedForKeepAlive) {
                            const gap = this.lastGetKeepAliveResponseFromServerTimstamp - now;
                            if (ClientCoreSDK.DEBUG) {
                                Logger.warn(KeepAliveDaemon.TAG, '【IMCORE】心跳线程执行中...延迟为： ', gap);
                            }
                            if (
                                gap >=
                                KeepAliveDaemon.NETWORK_CONNECTION_TIME_OUT
                            ) {
                                willStop = true;
                                ClientCoreSDK.getInstance().restart();
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
        this.init = false;
    }

    public start(immediately: boolean): void {
        this.reRunProcess.start(immediately);
        this.keepAliveRunning = true;
        if (ClientCoreSDK.DEBUG) {
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
