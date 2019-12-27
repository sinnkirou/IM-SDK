export default class PErrorResponse {
    private errorCode: number = -1;
    private errorMsg: string = null;

    constructor(errorCode: number, errorMsg: string) {
        this.errorCode = errorCode;
        this.errorMsg = errorMsg;
    }

    public getErrorCode(): number {
        return this.errorCode;
    }

    public setErrorCode(errorCode: number): void {
        this.errorCode = errorCode;
    }

    public getErrorMsg(): string {
        return this.errorMsg;
    }

    public setErrorMsg(errorMsg: string): void {
        this.errorMsg = errorMsg;
    }
}
