import React, { useEffect, useRef, useState } from 'react';
import ReactDom from 'react-dom';
// import style from './index';
import Manager, { Events } from '../src/index';
// import Manager from '../dist/index';

const Demo = () => {
	const { ChatBaseEventImpl, ChatTransDataEventImpl, MessageQoSEventImpl } = Events;
	const [status, setStatus] = useState(null);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [lostMsgs, setLostMsgs] = useState(null);
	const [msgBeReveived, setMsgBeReveived] = useState(null);
	const manager = new Manager({
		wsUrl: 'ws://192.168.198.202:7901/ws',
		chatbaseEventImpl: new ChatBaseEventImpl(
			() => {
				setStatus('登陆成功');
			},
			() => {
				setStatus('登陆失败');
			},
			() => {
				setStatus('连接失败');
			}
		),
		chatTransDataEventImpl: new ChatTransDataEventImpl(onTransBufferCB, onTransErrorCB),
		messageQoSEventImpl: new MessageQoSEventImpl(handleMessageLost, messagesBeReceivedCB)
	});

	useEffect(() => componentWillUnmount, []);
	const from = useRef(null);
	const to = useRef(null);
	const content = useRef(null);

	function componentWillUnmount() {
		// 组件销毁时你要执行的代码
		manager.release();
		console.debug('组件销毁？');
	}

	function onTransBufferCB(params) {
		const { fingerPrintOfProtocal, userid, dataContent, typeu } = params;
		setMessage(
			`fp: ${fingerPrintOfProtocal}\n\n userid: ${userid}\n\n dataContent: ${dataContent}\n\n typeu: ${typeu}`
		);
	}

	function onTransErrorCB(params) {
		const { errorCode, errorMsg } = params;
		setError(`errorCode: ${errorCode}\n\n errorMsg:${errorMsg}`);
	}

	function handleMessageLost(lostMsgs: Array<object>) {
		setLostMsgs(lostMsgs.map((msg) => JSON.stringify(msg)).join(','));
	}

	function messagesBeReceivedCB(fp: string) {
		setMsgBeReveived(fp);
	}

	return (
		<div>
			{/* <h1>组件预览：</h1> */}
			from: <input type="text" id="from" defaultValue="1" ref={from} />
			<br />
			{status === '登陆成功' && <>
				to: <input type="text" id="to" ref={to} />
				<br />
				content: <input type="text" id="content" ref={content} />
				<br />
				<input
				type="button"
				value="发送"
				onClick={() => {
					manager.send(content.current.value, from.current.value, to.current.value, true);
				}}
			/>
			</>}
			{status === null && (
				<input
					type="button"
					value="登陆"
					onClick={() => {
						manager.login(from.current.value, 'token');
					}}
				/>
			)}
			{status === '登陆成功' && (
				<input
					type="button"
					value="注销"
					onClick={() => {
						manager.logout();
					}}
				/>
			)}
			
			<br />
			{<h3>{status || ''}</h3>}
			<br />
			-------------------------- 通用信息：
			{<p>{message || '无'}</p>}
			<br />
			-------------------------- 错误信息：
			{<p>{error || '无'}</p>}
			<br />
			-------------------------- 丢失信息：
			{<p>{lostMsgs || '无'}</p>}
			<br />
			-------------------------- 已发送信息：
			{<p>{msgBeReveived || '无'}</p>}
		</div>
	);
};

ReactDom.render(<Demo />, document.getElementById('root'));
