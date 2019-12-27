export default interface IChatTransDataEvent {

    onTransBuffer(fingerPrintOfProtocal: string, userid: string, dataContent: string, typeu: number, callback?: (res: any) => void): void;
    
    onErrorResponse(errorCode: number, errorMsg: string, callback?: (res: any) => void): void;
}
