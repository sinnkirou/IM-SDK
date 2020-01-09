export default interface IChatBaseEvent {

	onLoginMessage(dwErrorCode: number): void;

	onLinkCloseMessage(dwErrorCode: number): void;

}
