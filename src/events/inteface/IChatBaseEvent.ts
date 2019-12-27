export default interface IChatBaseEvent {

	// constructor(onLoginOrReloginSuccessCB?: () => void, onLoginOrReloginFailCB?: () => void, onLinkCloseMessageCB?: () => void);

	onLoginMessage(dwErrorCode: number): void;

	onLinkCloseMessage(dwErrorCode: number): void;

}
