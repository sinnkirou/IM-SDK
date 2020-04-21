import Protocal from '../base/Protocal';
import MockThread from '../utils//MockThread';
import ClientCoreSDK from './ClientCoreSDK';
import { SendCommonDataAsync } from '../core/LocalWSDataSender';
import Logger from '../utils/Logger';

export default class QoS4SendDaemon {
    private static TAG: string = QoS4SendDaemon.name;
    private static instance: QoS4SendDaemon = null;
    private static CHECH_INTERVAL: number = 5000;
    private static MESSAGES_JUST$NOW_TIME: number = 3000;
    private static QOS_TRY_COUNT: number = 2;
    private sentMessages: Map<string, Protocal> = new Map();
    private sendMessagesTimestamp: Map<string, number> = new Map();
    private running: boolean = false;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(reset: boolean= false): QoS4SendDaemon {
        if (QoS4SendDaemon.instance == null || reset) {
            QoS4SendDaemon.instance = new QoS4SendDaemon();
        }

        return QoS4SendDaemon.instance;
    }

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (!this.init) {
            let doInBackgound = () => {
                let lostMessages: Array<Protocal> = new Array<Protocal>();

                try {
                    if (ClientCoreSDK.DEBUG) {
                        Logger.debug(
                            QoS4SendDaemon.TAG,
                            '【IMCORE】【QoS】=========== 消息发送质量保证线程运行中, 当前需要处理的列表长度为' + this.sentMessages.size + '...'
                        );
                    }

                    for (let key of this.sentMessages.keys()) {
                        let p: Protocal = this.sentMessages.get(key);
                        if (p != null && p.isQoS()) {
                            if (p.getRetryCount() >= QoS4SendDaemon.QOS_TRY_COUNT) {
                                if (ClientCoreSDK.DEBUG) {
                                    Logger.debug(
                                        QoS4SendDaemon.TAG,
                                        '【IMCORE】【QoS】指纹为' +
                                        p.getFp() +
                                        '的消息包重传次数已达' +
                                        p.getRetryCount() +
                                        '(最多' +
                                        QoS4SendDaemon.QOS_TRY_COUNT +
                                        '次)上限，将判定为丢包！'
                                    );
                                }

                                lostMessages.push(p);
                                this.remove(p.getFp());
                            } else {
                                let delta: number = new Date().getTime() - this.sendMessagesTimestamp.get(key);
                                if (delta <= QoS4SendDaemon.MESSAGES_JUST$NOW_TIME) {
                                    if (ClientCoreSDK.DEBUG) {
                                        Logger.warn(
                                            QoS4SendDaemon.TAG,
                                            '【IMCORE】【QoS】指纹为' +
                                            key +
                                            '的包距"刚刚"发出才' +
                                            delta +
                                            'ms(<=' +
                                            QoS4SendDaemon.MESSAGES_JUST$NOW_TIME +
                                            'ms将被认定是"刚刚"), 本次不需要重传哦.'
                                        );
                                    }
                                } else {
                                    new SendCommonDataAsync(p).exceute((code) => {
                                        if (code == 0) {
                                            p.increaseRetryCount();
                                            if (ClientCoreSDK.DEBUG) {
                                                Logger.debug(
                                                    QoS4SendDaemon.TAG,
                                                    '【IMCORE】【QoS】指纹为' +
                                                    p.getFp() +
                                                    '的消息包已成功进行重传，此次之后重传次数已达' +
                                                    p.getRetryCount() +
                                                    '(最多' +
                                                    QoS4SendDaemon.QOS_TRY_COUNT +
                                                    '次).'
                                                );
                                            }
                                        } else {
                                            Logger.warn(
                                                QoS4SendDaemon.TAG,
                                                '【IMCORE】【QoS】指纹为' +
                                                p.getFp() +
                                                '的消息包重传失败，它的重传次数之前已累计为' +
                                                p.getRetryCount() +
                                                '(最多' +
                                                QoS4SendDaemon.QOS_TRY_COUNT +
                                                '次).'
                                            );
                                        }
                                    });
                                }
                            }
                        } else {
                            this.remove(key);
                        }
                    }

                } catch (var7) {
                    Logger.warn(QoS4SendDaemon.TAG, '【IMCORE】【QoS】消息发送质量保证线程运行时发生异常,' + var7.getMessage(), var7);
                }

                if (lostMessages != null && lostMessages.length > 0) {
                    this.notifyMessageLost(lostMessages);
                }

            };

            this.reRunProcess = new MockThread(doInBackgound, QoS4SendDaemon.CHECH_INTERVAL);

            this.init = true;
        }
    }

    protected notifyMessageLost(lostMessages: Array<Protocal>): void {
        if (ClientCoreSDK.getInstance().getMessageQoSEvent() != null) {
            ClientCoreSDK.getInstance().getMessageQoSEvent().messagesLost(lostMessages);
        }

    }

    public startup(immediately: boolean): void {
        this.reRunProcess.start(immediately);
        this.running = true;
    }

    public stop(): void {
        this.reRunProcess.stop();
        this.running = false;
        this.init = false;
    }

    public isRunning(): boolean {
        return this.running;
    }

    public isInitialized(): boolean {
        return this.init;
    }

    exist(fingerPrint: string): boolean {
        return this.sentMessages.get(fingerPrint) != null;
    }

    public put(p: Protocal): void {
        if (p == null) {
            Logger.warn(QoS4SendDaemon.TAG, 'Invalid arg p==null.');
        } else if (p.getFp() == null) {
            Logger.warn(QoS4SendDaemon.TAG, 'Invalid arg p.getFp() == null.');
        } else if (!p.isQoS()) {
            Logger.warn(QoS4SendDaemon.TAG, 'This protocal is not  pkg, ignore it!');
        } else {
            if (this.sentMessages.get(p.getFp()) != null) {
                Logger.warn(
                    QoS4SendDaemon.TAG,
                    '【IMCORE】【QoS】指纹为' + p.getFp() + '的消息已经放入了发送质量保证队列，该消息为何会重复？（生成的指纹码重复？还是重复put？）'
                );
            }

            this.sentMessages.set(p.getFp(), p);
            this.sendMessagesTimestamp.set(p.getFp(), new Date().getTime());
        }
    }

    public remove(fingerPrint: string): void {
        this.sendMessagesTimestamp.delete(fingerPrint);
        const result = this.sentMessages.delete(fingerPrint);

        Logger.warn(
            QoS4SendDaemon.TAG,
            '【IMCORE】【QoS】指纹为' + fingerPrint + '的消息已成功从发送质量保证队列中移除(可能是收到接收方的应答也可能是达到了重传的次数上限)'
        );
    }

    public clear(): void {
        this.sentMessages.clear();
        this.sendMessagesTimestamp.clear();
    }

    public size(): number {
        return this.sentMessages.size;
    }
}
