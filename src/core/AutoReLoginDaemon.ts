import _ from 'lodash';
import ClientCoreSDK from './ClientCoreSDK';
import LocalWSDataSender from './LocalWSDataSender';
import LocalWSDataReciever from './LocalWSDataReciever';
import MockThread from '../utils/MockThread';

export default class AutoReLoginDaemon {
    private static TAG: string = 'AutoReLoginDaemon';
    private static instance: AutoReLoginDaemon = null;
    public static AUTO_RE$LOGIN_INTERVAL: number = 2000;
    private autoReLoginRunning: boolean = false;
    // private _excuting: boolean = false;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(): AutoReLoginDaemon {
        if (AutoReLoginDaemon.instance == null) {
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
                    console.log(AutoReLoginDaemon.TAG, "【IMCORE】自动重新登陆线程执行中, autoReLogin?" + ClientCoreSDK.autoReLogin + "...");
                }

                if (ClientCoreSDK.autoReLogin) {
                    let code: number = LocalWSDataSender.getInstance().sendLogin(ClientCoreSDK.getInstance().getCurrentLoginUserId(), ClientCoreSDK.getInstance().getCurrentLoginToken(), ClientCoreSDK.getInstance().getCurrentLoginExtra());
                    if (code ===0){
                        LocalWSDataReciever.getInstance().startup();
                    }
                }
            }, AutoReLoginDaemon.AUTO_RE$LOGIN_INTERVAL);
            this.init = true;
        }
    }

    public stop(): void {
        // this.handler.removeCallbacks(this.runnable);
        this.reRunProcess.stop();
        this.autoReLoginRunning = false;
    }

    public start(immediately: boolean): void {
        // this.stop();
        this.reRunProcess.start(immediately);
        // this.handler.postDelayed(this.runnable, immediately ? 0L : (long)AUTO_RE$LOGIN_INTERVAL);

        this.autoReLoginRunning = true;
    }

    public isAutoReLoginRunning(): boolean {
        return this.autoReLoginRunning;
    }

    public isInit(): boolean {
        return this.init;
    }
}
