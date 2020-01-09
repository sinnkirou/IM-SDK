export default class MockThread {

    private doInBackground: any = null;
    private reRunProcess = null;
    private interval = null;
    private trigger: boolean = true;

    constructor(doInBackground: any, millSeconds: number) {
        this.doInBackground = doInBackground;
        this.reRunProcess = () => {
            this.interval = setInterval(() => {
                if(this.trigger){
                    this.doInBackground();
                }
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
        this.trigger = false;
        clearInterval(this.interval);
    }
}