export default class MockThread {

    private doInBackground: any = null;
    private reRunProcess = null;
    private interval = null;

    constructor(doInBackground: any, millSeconds: number) {
        this.doInBackground = doInBackground;
        this.reRunProcess = () => {
            this.interval = setInterval(() => {
                this.doInBackground();
            }, millSeconds)
        }
    }

    public start(immediately: boolean): void {
        if (immediately) {
            this.doInBackground();
        }
        this.reRunProcess();
    }

    public stop(): void {
        clearInterval(this.interval);
    }
}