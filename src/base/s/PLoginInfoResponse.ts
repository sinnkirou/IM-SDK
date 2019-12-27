export default class PLoginInfoResponse {
    private code: number = 0;

    constructor(code: number) {
        this.code = code;
    }

    public getCode(): number {
        return this.code;
    }

    public setCode(code: number): void {
        this.code = code;
    }
}
