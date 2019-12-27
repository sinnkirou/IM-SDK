import Protocal from './Protocal';
import ProtocalType from './ProtocalType';
import PKeepAlive from './c/PKeepAlive';
import PLoginInfo from './c/PLoginInfo';
import PLoginInfoResponse from './s/PLoginInfoResponse';
import PErrorResponse from './s/PErrorResponse';

export default class ProtocalFactory {
    constructor() {
    }

    public static createPKeepAlive(from_user_id: string): Protocal {
        return new Protocal({
            type: ProtocalType.FROM_CLIENT_TYPE_OF_KEEP$ALIVE,
            dataContent: JSON.stringify(new PKeepAlive()),
            from: from_user_id,
            to: "0"
        });
    }

    public static createPLogoutInfo(user_id: string): Protocal {
        return new Protocal({
            type: ProtocalType.FROM_CLIENT_TYPE_OF_LOGOUT,
            dataContent: '',
            from: user_id,
            to: "0"
        });
    }

    public static createPLoginInfo(userId: string, token: string, extra: string): Protocal {
        return new Protocal({
            type: ProtocalType.FROM_CLIENT_TYPE_OF_LOGIN,
            dataContent: JSON.stringify(new PLoginInfo(userId, token, extra)),
            from: userId,
            to: "0"
        });
    }

    public static createCommonData(dataContent: string, from_user_id: string, to_user_id: string, Qos: boolean, fingerPrint?: string, typeu: number = -1): Protocal {
        return new Protocal({
            type: ProtocalType.FROM_CLIENT_TYPE_OF_COMMON$DATA,
            dataContent,
            from: from_user_id,
            to: to_user_id,
            Qos: Qos,
            fp: fingerPrint,
            typeu
        });
    }

    public static createRecivedBack(from_user_id: string, recievedMessageFingerPrint: string, bridge: boolean = false): Protocal {
        let p: Protocal = new Protocal({
            type: ProtocalType.FROM_CLIENT_TYPE_OF_RECIVED,
            dataContent: recievedMessageFingerPrint,
            from: from_user_id,
            to: "0",
        });
        p.setBridge(bridge);
        return p;
    }

    public static parsePLoginInfoResponse(dataContentOfProtocal: string): PLoginInfoResponse {
        const { code } = JSON.parse(dataContentOfProtocal);
        return new PLoginInfoResponse(code)
    }

    public static parsePErrorResponse( dataContentOfProtocal:string): PErrorResponse {
        const { errorCode, errorMsg } = JSON.parse(dataContentOfProtocal);
        return new PErrorResponse(errorCode, errorMsg);
    }
}
