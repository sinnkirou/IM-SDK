import Protocal from '../base/Protocal';
import MockThread from '../utils//MockThread';
import ClientCoreSDK from './ClientCoreSDK';
import { SendCommonDataAsync } from '../core/LocalWSDataSender';

export default class QoS4SendDaemon {
    private static TAG: string = 'QoS4SendDaemon';
    private static instance: QoS4SendDaemon = null;
    public static CHECH_INTERVAL: number = 5000;
    public static MESSAGES_JUST$NOW_TIME: number = 3000;
    public static QOS_TRY_COUNT: number = 2;
    private sentMessages: Map<string, Protocal> = new Map();
    private sendMessagesTimestamp: Map<string, number> = new Map();
    private running: boolean = false;
    private init: boolean = false;
    private reRunProcess: MockThread = null;

    public static getInstance(): QoS4SendDaemon {
        if (QoS4SendDaemon.instance == null) {
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
                        console.debug(
                            QoS4SendDaemon.TAG,
                            '【IMCORE】【QoS】=========== 消息发送质量保证线程运行中, 当前需要处理的列表长度为' + this.sentMessages.size + '...'
                        );
                    }

                    for (let key of this.sentMessages.keys()) {
                        let p: Protocal = this.sentMessages.get(key);
                        if (p != null && p.isQoS()) {
                            if (p.getRetryCount() >= 2) {
                                if (ClientCoreSDK.DEBUG) {
                                    console.debug(
                                        QoS4SendDaemon.TAG,
                                        '【IMCORE】【QoS】指纹为' +
                                        p.getFp() +
                                        '的消息包重传次数已达' +
                                        p.getRetryCount() +
                                        '(最多' +
                                        2 +
                                        '次)上限，将判定为丢包！'
                                    );
                                }

                                lostMessages.push(p);
                                this.remove(p.getFp());
                            } else {
                                let delta: number = new Date().getTime() - this.sendMessagesTimestamp.get(key);
                                if (delta <= 3000) {
                                    if (ClientCoreSDK.DEBUG) {
                                        console.warn(
                                            QoS4SendDaemon.TAG,
                                            '【IMCORE】【QoS】指纹为' +
                                            key +
                                            '的包距"刚刚"发出才' +
                                            delta +
                                            'ms(<=' +
                                            3000 +
                                            'ms将被认定是"刚刚"), 本次不需要重传哦.'
                                        );
                                    }
                                } else {
                                    new SendCommonDataAsync(p).exceute((code) => {
                                        if (code == 0) {
                                            p.increaseRetryCount();
                                            if (ClientCoreSDK.DEBUG) {
                                                console.debug(
                                                    QoS4SendDaemon.TAG,
                                                    '【IMCORE】【QoS】指纹为' +
                                                    p.getFp() +
                                                    '的消息包已成功进行重传，此次之后重传次数已达' +
                                                    p.getRetryCount() +
                                                    '(最多' +
                                                    2 +
                                                    '次).'
                                                );
                                            }
                                        } else {
                                            console.warn(
                                                QoS4SendDaemon.TAG,
                                                '【IMCORE】【QoS】指纹为' +
                                                p.getFp() +
                                                '的消息包重传失败，它的重传次数之前已累计为' +
                                                p.getRetryCount() +
                                                '(最多' +
                                                2 +
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

                    // return lostMessages;
                } catch (var7) {
                    console.warn(QoS4SendDaemon.TAG, '【IMCORE】【QoS】消息发送质量保证线程运行时发生异常,' + var7.getMessage(), var7);
                    // return lostMessages;
                }

                if (lostMessages != null && lostMessages.length > 0) {
                    this.notifyMessageLost(lostMessages);
                }

            };
            // protected void onPostExecute(ArrayList<Protocal> al) {
            //     if (al != null && al.size() > 0) {
            //         QoS4SendDaemon.this.notifyMessageLost(al);
            //     }

            //     QoS4SendDaemon.this.handler.postDelayed(QoS4SendDaemon.this.runnable, 5000L);
            // }

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
        // this.stop();
        // this.handler.postDelayed(this.runnable, immediately ? 0L : 5000L);
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

    exist(fingerPrint: string): boolean {
        return this.sentMessages.get(fingerPrint) != null;
    }

    public put(p: Protocal): void {
        if (p == null) {
            console.warn(QoS4SendDaemon.TAG, 'Invalid arg p==null.');
        } else if (p.getFp() == null) {
            console.warn(QoS4SendDaemon.TAG, 'Invalid arg p.getFp() == null.');
        } else if (!p.isQoS()) {
            console.warn(QoS4SendDaemon.TAG, 'This protocal is not  pkg, ignore it!');
        } else {
            if (this.sentMessages.get(p.getFp()) != null) {
                console.warn(
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

        console.warn(
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
