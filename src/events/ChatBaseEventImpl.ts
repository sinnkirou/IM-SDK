import IChatBaseEvent from './inteface/IChatBaseEvent';
import {ChatBaseCB, } from './inteface/IEventCallBack';
import Logger from '../utils/Logger';

export default class ChatBaseEventImpl implements IChatBaseEvent {
	private static TAG: string = ChatBaseEventImpl.name;
	private onLoginOrReloginSuccessCB: () => void = null;
	private onLoginOrReloginFailCB: () => void = null;
	private onLinkCloseMessageCB: () => void = null;

	constructor(options?: ChatBaseCB) {
		const { onLoginOrReloginSuccessCB, onLoginOrReloginFailCB, onLinkCloseMessageCB } = options;
		this.onLoginOrReloginSuccessCB = onLoginOrReloginSuccessCB;
		this.onLinkCloseMessageCB = onLinkCloseMessageCB;
		this.onLoginOrReloginFailCB = onLoginOrReloginFailCB;
	}

	public onLoginMessage(dwErrorCode: number): void {
		if (dwErrorCode == 0) {
			Logger.debug(ChatBaseEventImpl.TAG, "【DEBUG_UI】IM服务器登录/重连成功！");
			if (this.onLoginOrReloginSuccessCB) {
				this.onLoginOrReloginSuccessCB();
			}
		}
		else {
			Logger.error(ChatBaseEventImpl.TAG, "【DEBUG_UI】IM服务器登录/连接失败，错误代码：" + dwErrorCode);
			if (this.onLoginOrReloginFailCB) {
				this.onLoginOrReloginFailCB();
			}
		}

	}

	public onLinkCloseMessage(dwErrorCode: number): void {
		Logger.error(ChatBaseEventImpl.TAG, "【DEBUG_UI】与IM服务器的网络连接出错关闭了，error：" + dwErrorCode);
		if (this.onLinkCloseMessageCB) {
			this.onLinkCloseMessageCB();
		}
	}

}
