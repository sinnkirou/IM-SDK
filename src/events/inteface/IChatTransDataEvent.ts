import Protocal from '../../base/Protocal';

export default interface IChatTransDataEvent {

    onTransBuffer(protocal: Protocal): void;
    
    onErrorResponse(errorCode: number, errorMsg: string, callback?: (res: any) => void): void;
}
