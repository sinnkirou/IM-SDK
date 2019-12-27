import Protocal from '../../base/Protocal';

export default interface IMessageQoSEvent {

    messagesLost(lostMessages: Array<Protocal>, callBack?: (res: any) => void): void;

    messagesBeReceived(theFingerPrint: string, callBack?: (fp: string) => void): void;

}
