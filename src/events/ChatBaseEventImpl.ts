import IChatBaseEvent from './inteface/IChatBaseEvent';
import { ChatBaseCB } from '../index.d';

export default class ChatBaseEventImpl implements IChatBaseEvent {
	private static TAG: string = "ChatBaseEventImpl";
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
			console.debug(ChatBaseEventImpl.TAG, "【DEBUG_UI】IM服务器登录/重连成功！");
			if (this.onLoginOrReloginSuccessCB) {
				this.onLoginOrReloginSuccessCB();
			}
		}
		else {
			console.error(ChatBaseEventImpl.TAG, "【DEBUG_UI】IM服务器登录/连接失败，错误代码：" + dwErrorCode);
			if (this.onLoginOrReloginFailCB) {
				this.onLoginOrReloginFailCB();
			}
		}

	}

	public onLinkCloseMessage(dwErrorCode: number): void {
		console.error(ChatBaseEventImpl.TAG, "【DEBUG_UI】与IM服务器的网络连接出错关闭了，error：" + dwErrorCode);
		if (this.onLinkCloseMessageCB) {
			this.onLinkCloseMessageCB();
		}
	}

}
