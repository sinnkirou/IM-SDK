import ClientCoreSDK from './ClientCoreSDK';
import LocalWSDataSender from './LocalWSDataSender';
import LocalWSDataReciever from './LocalWSDataReciever';
import MockThread from '../utils/MockThread';
import Logger from '../utils/Logger';

export default class AutoReLoginDaemon {
    private static TAG: string = AutoReLoginDaemon.name;
    private static instance: AutoReLoginDaemon = null;
    private static AUTO_RE$LOGIN_INTERVAL: number = 2000;
    private autoReLoginRunning: boolean = false;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(reset: boolean= false): AutoReLoginDaemon {
        if (AutoReLoginDaemon.instance == null || reset) {
            AutoReLoginDaemon.instance = new AutoReLoginDaemon();
        }

        return AutoReLoginDaemon.instance;
    }

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (!this.init) {
            this.reRunProcess = new MockThread(() => {
                if (ClientCoreSDK.DEBUG) {
                    Logger.debug(AutoReLoginDaemon.TAG, "【IMCORE】自动重新登陆线程执行中, autoReLogin?" + ClientCoreSDK.autoReLogin + "...");
                }

                if (ClientCoreSDK.autoReLogin) {
                    let code: number = LocalWSDataSender.getInstance().sendLogin(ClientCoreSDK.getInstance().getCurrentLoginUserId(), ClientCoreSDK.getInstance().getCurrentLoginToken(), ClientCoreSDK.getInstance().getApp(), ClientCoreSDK.getInstance().getCurrentLoginExtra());
                    if (code ===0){
                        LocalWSDataReciever.getInstance().startup();
                    }
                }
            }, AutoReLoginDaemon.AUTO_RE$LOGIN_INTERVAL);
            this.init = true;
        }
    }

    public stop(): void {
        this.reRunProcess.stop();
        this.autoReLoginRunning = false;
        this.init = false;
    }

    public start(immediately: boolean): void {
        this.reRunProcess.start(immediately);
        this.autoReLoginRunning = true;
    }

    public isAutoReLoginRunning(): boolean {
        return this.autoReLoginRunning;
    }

    public isInitialized(): boolean {
        return this.init;
    }
}
