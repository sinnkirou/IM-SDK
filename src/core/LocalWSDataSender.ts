import ClientCoreSDK from './ClientCoreSDK';
import Protocal from '../base/Protocal';
import ProtocalFactory from '../base/ProtocalFactory';
import WebsocketUtil from '../utils/WebsocketUtil';
import LocalWSProvider from './LocalWSProvider';
import LocalWSDataReciever from './LocalWSDataReciever';
import QoS4SendDaemon from './QoS4SendDaemon';
import Logger from '../utils/Logger';
import MockThread from '../utils/MockThread';

export default class LocalWSDataSender {
	public static TAG: string = LocalWSDataSender.name;
	private static instance: LocalWSDataSender = null;

	public static getInstance(): LocalWSDataSender {
		if (LocalWSDataSender.instance == null) {
			LocalWSDataSender.instance = new LocalWSDataSender();
		}

		return LocalWSDataSender.instance;
	}

	constructor() { }

	sendLogin(loginUserId: string, loginToken: string, app: string, extra: string): number {
		let p: Protocal = ProtocalFactory.createPLoginInfo(loginUserId, loginToken, app, extra);
		let code: number = this.send(p.toGsonString());
		if (code == 0) {
			ClientCoreSDK.getInstance().setCurrentLoginUserId(loginUserId);
			ClientCoreSDK.getInstance().setCurrentLoginToken(loginToken);
			ClientCoreSDK.getInstance().setCurrentLoginExtra(extra);
			ClientCoreSDK.getInstance().setApp(app);
		}

		return code;
	}

	public sendLogOut(): number {
		let code: number = 0;
		if (ClientCoreSDK.getInstance().isLoginHasInit()) {
			let p: Protocal = ProtocalFactory.createPLogoutInfo(ClientCoreSDK.getInstance().getCurrentLoginUserId());
			code = this.send(p.toGsonString());
		}

		// ClientCoreSDK.getInstance().release();
		return code;
	}

	sendKeepAlive(): number {
		let p: Protocal = ProtocalFactory.createPKeepAlive(ClientCoreSDK.getInstance().getCurrentLoginUserId());
		return this.send(p.toGsonString());
	}

	public sendCommonData(
		dataContentWidthStr: string,
		to_user_id: string,
		Qos: boolean = true,
		fingerPrint: string = null,
		typeu: number = -1
	): number {
		return this.sendCommonDataWithProtocal(
			ProtocalFactory.createCommonData(
				dataContentWidthStr,
				ClientCoreSDK.getInstance().getCurrentLoginUserId(),
				to_user_id,
				Qos,
				fingerPrint,
				typeu
			)
		);
	}

	public sendCommonDataWithProtocal(p: Protocal): number {
		if (p != null) {
			let code: number = this.send(p.toGsonString());
			if (code == 0 && p.isQoS() && !QoS4SendDaemon.getInstance().exist(p.getFp())) {
				QoS4SendDaemon.getInstance().put(p);
			}

			return code;
		} else {
			return 4;
		}
	}

	private send(data: string): number {
		if (!ClientCoreSDK.getInstance().isInitialed()) {
			Logger.error(LocalWSDataSender.TAG, '【IMCORE】未初始化，send数据没有继续!');
			return 203;
		} else if (!ClientCoreSDK.getInstance().isLocalDeviceNetworkOk()) {
			Logger.error(LocalWSDataSender.TAG, '【IMCORE】本地网络不能工作，send数据没有继续!');
			return 204;
		} else {
			let ds: WebSocket = LocalWSProvider.getInstance().getLocalWebSocket();
			if (ds != null && ds.readyState === ds.OPEN) {
				try {
					if (LocalWSProvider.getInstance().getURL == null) {
						Logger.warn(
							LocalWSDataSender.TAG,
							'【IMCORE】send数据没有继续，原因是ConfigEntity.server_ip==null!'
						);
						return 205;
					}

				} catch (var5) {
					Logger.warn(LocalWSDataSender.TAG, '【IMCORE】send时出错，原因是：' + var5.getMessage(), var5);
					return 202;
				}
			}

			return WebsocketUtil.send(ds, data) ? 0 : 3;
		}
	}
}

export class SendLoginDataAsync {
	protected loginUserId: string;
	protected loginToken: string;
	protected extra: string;
	protected app: string;

	constructor(loginUserId: string, loginToken: string, app: string, extra: string = null) {
		this.loginUserId = null;
		this.loginToken = null;
		this.extra = null;
		this.loginUserId = loginUserId;
		this.loginToken = loginToken;
		this.app = app;
		this.extra = extra;
	}

	public exceute(callBack?: (code: number) => void): void {
		const reRunProcess = new MockThread(async () => {
			if(ClientCoreSDK.DEBUG){
				Logger.debug(LocalWSDataSender.TAG, '检查ws初始化状态并尝试登陆');
			}
			if (!ClientCoreSDK.getInstance().isInitialed()) {
				let code: number = 203;
				Logger.error(LocalWSDataSender.TAG, '【IMCORE】未初始化，send数据没有继续!');
				if (callBack)
					callBack(code);
				reRunProcess.stop();
			} else if (!ClientCoreSDK.getInstance().isLocalDeviceNetworkOk()) {
				let code: number = 204;
				Logger.error(LocalWSDataSender.TAG, '【IMCORE】本地网络不能工作，send数据没有继续!');
				if (callBack)
					callBack(code);
				reRunProcess.stop();
			} else if (LocalWSProvider.getInstance().isLocalWebSocketOK()) {
				let code: number = await LocalWSDataSender.getInstance().sendLogin(
					this.loginUserId,
					this.loginToken,
					this.app,
					this.extra
				);

				if (code == 0) {
					LocalWSDataReciever.getInstance().startup();
				} else {
					Logger.debug(LocalWSDataSender.TAG, '【IMCORE】登陆数据发送失败, 错误码是：' + code + '！');
				}
				if (callBack)
					callBack(code);
				reRunProcess.stop();
			}
		}, 500)
		reRunProcess.start(true);
	}
}

export class SendCommonDataAsync {
	protected p: Protocal;

	SendCommonDataAsync(dataContentWidthStr: string, to_user_id: string, fingerPrint: string = null, typeu: number = -1) {
		this.p = ProtocalFactory.createCommonData(
			dataContentWidthStr,
			ClientCoreSDK.getInstance().getCurrentLoginUserId(),
			to_user_id,
			true,
			fingerPrint,
			typeu
		);
	}

	constructor(p: Protocal) {
		this.p = null;
		if (p == null) {
			Logger.warn(LocalWSDataSender.TAG, '【IMCORE】无效的参数p==null!');
		} else {
			this.p = p;
		}
	}

	public async exceute(callBack?: (code: number) => void): Promise<void> {
		let code: number =
			this.p != null ? await LocalWSDataSender.getInstance().sendCommonDataWithProtocal(this.p) : -1;

		if (code !== 0) {
			Logger.debug(LocalWSDataSender.TAG, '【IMCORE】通用数据发送失败, 错误码是：' + code + '！');
		}
		if (callBack)
			callBack(code);
	}
}

export class SendLogoutDataAsync {
	protected p: Protocal;

	SendLogoutDataAsync() {
		this.p = ProtocalFactory.createPLogoutInfo(
			ClientCoreSDK.getInstance().getCurrentLoginUserId(),
		);
	}

	public async exceute(callBack?: (code: number) => void): Promise<void> {
		let code: number = await LocalWSDataSender.getInstance().sendLogOut();

		if (code !== 0) {
			Logger.debug(LocalWSDataSender.TAG, '【IMCORE】登出数据发送失败, 错误码是：' + code + '！');
		}
		if (callBack)
			callBack(code);
	}
}
