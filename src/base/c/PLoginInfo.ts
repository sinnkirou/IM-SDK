export default class PLoginInfo {
    private loginUserId: string;
    private loginToken: string;
    private extra: string;

    constructor(loginUserId: string, loginToken: string, extra: string = null) {
        this.loginUserId = null;
        this.loginToken = null;
        this.extra = null;
        this.loginUserId = loginUserId;
        this.loginToken = loginToken;
        this.extra = extra;
    }

    public getLoginUserId(): string {
        return this.loginUserId;
    }

    public setLoginUserId(loginUserId: string): void {
        this.loginUserId = loginUserId;
    }

    public getLoginToken(): string {
        return this.loginToken;
    }

    public setLoginToken(loginToken: string): void {
        this.loginToken = loginToken;
    }

    public getExtra(): string {
        return this.extra;
    }

    public setExtra(extra: string): void {
        this.extra = extra;
    }
}
