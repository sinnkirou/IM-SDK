import ClientCoreSDK from './core/ClientCoreSDK';
import ChatBaseEventImpl from './events/ChatBaseEventImpl';
import ChatTransDataEventImpl from './events/ChatTransDataEventImpl';
import MessageQoSEventImpl from './events/MessageQoSEventImpl';
import { SendCommonDataAsync, SendLoginDataAsync, SendLogoutDataAsync } from './core/LocalWSDataSender';
import ProtocalFactory from './base/ProtocalFactory';
import { WSOptions } from './index.d';

export default class IMClientManager {
	private static TAG: string = 'IMClientManager';

	private static instance: IMClientManager = null;

	/** MobileIMSDK是否已被初始化. true表示已初化完成，否则未初始化. */
	private init: boolean = false;

	//
	private baseEventListener: ChatBaseEventImpl = null;
	//
	private transDataListener: ChatTransDataEventImpl = null;
	//
	private messageQoSListener: MessageQoSEventImpl = null;

	public static getInstance(options: WSOptions): IMClientManager {
		if (IMClientManager.instance == null ) {
			const { wsUrl, } = options;
			if(wsUrl){
				IMClientManager.instance = new IMClientManager(options)
			}else{
				throw new Error("wsURL 参数不可为空");
			}
		};
		return IMClientManager.instance;
	}

	constructor(options: WSOptions) {
		this.initMobileIMSDK(options);
	}

	public initMobileIMSDK(options: WSOptions): void {
		if (!this.init) {
			// 设置AppKey
			// ConfigEntity.appKey = "5418023dfd98c579b6001741";

			// 设置服务器ip和服务器端口
			//			ConfigEntity.serverIP = "192.168.82.138";
			//			ConfigEntity.serverIP = "rbcore.openmob.net";
			//			ConfigEntity.serverWSPort = 7901;

			// MobileIMSDK核心IM框架的敏感度模式设置
			//			ConfigEntity.setSenseMode(SenseMode.MODE_10S);

			// 开启/关闭DEBUG信息输出
			//	    	ClientCoreSDK.DEBUG = false;

			// 【特别注意】请确保首先进行核心库的初始化（这是不同于iOS和Java端的地方)
			const { wsUrl, wsProtocal, chatBaseCB, chatTransDataCB, messageQoSCB} = options;
			ClientCoreSDK.getInstance().init(wsUrl, wsProtocal);

			// 设置事件回调
			this.baseEventListener = new ChatBaseEventImpl(chatBaseCB);
			this.transDataListener = new ChatTransDataEventImpl(chatTransDataCB);
			this.messageQoSListener = new MessageQoSEventImpl(messageQoSCB);
			ClientCoreSDK.getInstance().setChatBaseEvent(this.baseEventListener);
			ClientCoreSDK.getInstance().setChatTransDataEvent(this.transDataListener);
			ClientCoreSDK.getInstance().setMessageQoSEvent(this.messageQoSListener);

			this.init = true;
		}
	}

	public release(): void {
		ClientCoreSDK.getInstance().release();
		this.resetInitFlag();
	}

	/**
	 * 重置init标识。
	 * <p>
	 * <b>重要说明：</b>不退出APP的情况下，重新登陆时记得调用一下本方法，不然再
	 * 次调用 {@link #initMobileIMSDK()} 时也不会重新初始化MobileIMSDK（
	 * 详见 {@link #initMobileIMSDK()}代码）而报 code=203错误！
	 * 
	 */
	public resetInitFlag(): void {
		this.init = false;
	}

	public getTransDataListener(): ChatTransDataEventImpl {
		return this.transDataListener;
	}
	public getBaseEventListener(): ChatBaseEventImpl {
		return this.baseEventListener;
	}
	public getMessageQoSListener(): MessageQoSEventImpl {
		return this.messageQoSListener;
	}

	public login (logiUserId: string, loginToken: string, extra?: string, callBack?: (code: number) => void): void {
        new SendLoginDataAsync(logiUserId, loginToken, extra).exceute(callBack)
	}
	
    public logout (callBack?: (code: number) => void):void {
        new SendLogoutDataAsync().exceute(callBack);
    }
    public send (dataContent: string, from_user_id: string, to_user_id: string, Qos?: boolean, fingerPrint?: string, typeu: number = 0, callBack?: (code: number) => void): void {
        new SendCommonDataAsync(ProtocalFactory.createCommonData(dataContent, from_user_id, to_user_id, Qos, fingerPrint, typeu)).exceute(callBack);
	}
	
}
