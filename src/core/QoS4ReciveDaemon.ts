import ClientCoreSDK from './ClientCoreSDK';
import Protocal from '../base/Protocal';
import MockThread from '../utils//MockThread';
import Logger from '../utils/Logger';

export default class QoS4ReciveDaemon {
    private static TAG: string = 'QoS4ReciveDaemon';
    private static instance: QoS4ReciveDaemon = null;
    public static CHECH_INTERVAL: number = 300000;
    public static MESSAGES_VALID_TIME: number = 600000;
    private recievedMessages: Map<string, number> = new Map();
    private running: boolean = false;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(): QoS4ReciveDaemon {
        if (QoS4ReciveDaemon.instance == null) {
            QoS4ReciveDaemon.instance = new QoS4ReciveDaemon();
        }

        return QoS4ReciveDaemon.instance;
    }

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (!this.init) {
            let doInBackground = () => {
                if (ClientCoreSDK.DEBUG) {
                    Logger.debug(
                        QoS4ReciveDaemon.TAG,
                        '【IMCORE】【QoS接收方】++++++++++ START 暂存处理线程正在运行中，当前长度' + this.recievedMessages.size + '.'
                    );
                }

                for (let key of this.recievedMessages.keys()) {
                    let delta: number = new Date().getTime() - this.recievedMessages.get(key);
                    if (delta >= QoS4ReciveDaemon.MESSAGES_VALID_TIME) {
                        if (ClientCoreSDK.DEBUG) {
                            Logger.debug(
                                QoS4ReciveDaemon.TAG,
                                '【IMCORE】【QoS接收方】指纹为' + key + '的包已生存' + delta + 'ms(最大允许' + QoS4ReciveDaemon.MESSAGES_VALID_TIME + 'ms), 马上将删除之.'
                            );
                        }

                        this.recievedMessages.delete(key);
                    }
                }

                if (ClientCoreSDK.DEBUG) {
                    Logger.debug(
                        QoS4ReciveDaemon.TAG,
                        '【IMCORE】【QoS接收方】++++++++++ END 暂存处理线程正在运行中，当前长度' + this.recievedMessages.size + '.'
                    );
                }
            }
            this.reRunProcess = new MockThread(doInBackground, QoS4ReciveDaemon.CHECH_INTERVAL);

            this.init = true;
        }
    }

    public startup(immediately: boolean): void {
        // this.stop();
        if (this.recievedMessages != null && this.recievedMessages.size > 0) {
            for (let key of this.recievedMessages.keys()) {
                this.putImpl(key);
            }
        }

        this.reRunProcess.start(immediately);
        this.running = true;
    }

    public stop(): void {
        // this.handler.removeCallbacks(this.runnable);
        this.reRunProcess.stop();
        this.running = false;
    }

    public isRunning(): boolean {
        return this.running;
    }

    public isInit(): boolean {
        return this.init;
    }

    public addRecieved(p: Protocal): void {
        if (p != null && p.isQoS()) {
            this.addRecievedWithFp(p.getFp());
        }
    }

    public addRecievedWithFp(fingerPrintOfProtocal: string): void {
        if (fingerPrintOfProtocal == null) {
            Logger.warn(QoS4ReciveDaemon.TAG, '【IMCORE】无效的 fingerPrintOfProtocal==null!');
        } else {
            if (this.recievedMessages.get(fingerPrintOfProtocal)) {
                Logger.warn(
                    QoS4ReciveDaemon.TAG,
                    '【IMCORE】【QoS接收方】指纹为' +
                    fingerPrintOfProtocal +
                    '的消息已经存在于接收列表中，该消息重复了（原理可能是对方因未收到应答包而错误重传导致），更新收到时间戳哦.'
                );
            }

            this.putImpl(fingerPrintOfProtocal);
        }
    }

    private putImpl(fingerPrintOfProtocal: string): void {
        if (fingerPrintOfProtocal != null) {
            this.recievedMessages.set(fingerPrintOfProtocal, new Date().getTime());
        }
    }

    public hasRecieved(fingerPrintOfProtocal: string): boolean {
        return this.recievedMessages.get(fingerPrintOfProtocal) ? true : false;
    }

    public clear(): void {
        this.recievedMessages.clear();
    }

    public size(): number {
        return this.recievedMessages.size;
    }
}
