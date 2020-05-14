import uuid from 'uuid/v1';

interface Options {
    type?: number;
    dataContent?: string;
    from?: string;
    to?: string;
    Qos?: boolean;
    fp?: string;
    typeu?: number;
    sendTs?: number;
}

export default class Protocal {
    private bridge: boolean;
    private type: number;
    private dataContent: string;
    private from: string;
    private to: string;
    private fp: string;
    private Qos: boolean;
    private typeu: number;
    private retryCount: number;
    private sendTs: number;

    constructor(options: Options) {
        const { type = 0, dataContent = null, from = '-1', to = "0", Qos = false, typeu = -1, fp = null, sendTs = null } = options;
        this.bridge = false;
        this.type = type;
        this.dataContent = dataContent;
        this.from = from;
        this.to = to;
        this.fp = null;
        this.Qos = Qos;
        this.typeu = typeu;
        this.retryCount = 0;
        this.sendTs = sendTs;
        if (Qos && fp == null) {
            this.fp = Protocal.genFingerPrint();
        } else {
            this.fp = fp;
        }

    }

    public getType(): number {
        return this.type;
    }

    public setType(type: number): void {
        this.type = type;
    }

    public getDataContent(): string {
        return this.dataContent;
    }

    public setDataContent(dataContent: string): void {
        this.dataContent = dataContent;
    }

    public getFrom(): string {
        return this.from;
    }

    public setFrom(from: string): void {
        this.from = from;
    }

    public getTo(): string {
        return this.to;
    }

    public setTo(to: string): void {
        this.to = to;
    }

    public getFp(): string {
        return this.fp;
    }

    public getRetryCount(): number {
        return this.retryCount;
    }

    public increaseRetryCount(): void {
        ++this.retryCount;
    }

    public isQoS(): boolean {
        return this.Qos;
    }

    public setQoS(qoS: boolean): void {
        this.Qos = qoS;
    }

    public isBridge(): boolean {
        return this.bridge;
    }

    public setBridge(bridge: boolean): void {
        this.bridge = bridge;
    }

    public getTypeu(): number {
        return this.typeu;
    }

    public setTypeu(typeu: number): void {
        this.typeu = typeu;
    }

    public toGsonString(): string {
        // return (new Gson()).toJson(this);
        return JSON.stringify(this);
    }

    // public Object clone() {
    //     Protocal cloneP = new Protocal(this.getType(), this.getDataContent(), this.getFrom(), this.getTo(), this.isQoS(), this.getFp());
    //     cloneP.setBridge(this.bridge);
    //     cloneP.setTypeu(this.typeu);
    //     return cloneP;
    // }

    public static genFingerPrint(): string {
        return uuid();
    }
}