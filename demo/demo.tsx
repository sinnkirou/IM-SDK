import React, { useEffect, useRef, useState } from 'react';
import ReactDom from 'react-dom';
import styles from './index.less';
import Manager from '../src/index';
// import Manager from '../dist/index';
import moment from 'moment';

const Demo = () => {
	const [status, setStatus] = useState(null);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const [lostMsgs, setLostMsgs] = useState(null);
	const [msgBeReveived, setMsgBeReveived] = useState(null);
	const options = {
		wsUrl: 'ws://192.168.198.202:7901/ws',
		chatBaseCB: {
			onLoginOrReloginSuccessCB: () => {
				setStatus('登陆成功');
			},
			onLoginOrReloginFailCB: () => {
				setStatus('登陆失败');
			},
			onLinkCloseMessageCB: () => {
				setStatus('连接失败');
			}
		},
		chatTransDataCB: {
			onTransBufferCB,
			onTransErrorCB,
		},
		messageQoSCB: {
			handleMessageLost,
			messagesBeReceivedCB,
		}
	};
	Manager.getInstance(options);

	useEffect(() => componentWillUnmount, []);
	const from = useRef(null);
	const to = useRef(null);
	const content = useRef(null);

	function componentWillUnmount() {
		// 组件销毁时你要执行的代码
		Manager.getInstance().release();
		console.debug('组件销毁？');
	}

	function onTransBufferCB(params) {
		const { fingerPrintOfProtocal, userid, dataContent, typeu, sendTs } = params;
		setMessage(
			`${message || ''}
			fp: ${fingerPrintOfProtocal}\n
			userid: ${userid}\n
			dataContent: ${dataContent}\n
			typeu: ${typeu}\n
			sendTs: ${moment(sendTs)}\n
			>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n`
		);
	}

	function onTransErrorCB(params) {
		const { errorCode, errorMsg } = params;
		setError(`errorCode: ${errorCode}\n errorMsg:${errorMsg}`);
	}

	function handleMessageLost(lostMsgs: Array<object>) {
		setLostMsgs(lostMsgs.map((msg) => JSON.stringify(msg)).join(','));
	}

	function messagesBeReceivedCB(fp: string) {
		setMsgBeReveived(fp);
	}

	return (
		<div className={styles.demo}>
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
						Manager.getInstance().send(content.current.value, from.current.value, to.current.value, true, null, null, code => {
							if (code === 0) {
								content.current.value = "";
							} else {
								setStatus(`发送失败，code：${code}`)
							}
						});
					}}
				/>
			</>}
			{status === null && (
				<input
					type="button"
					value="登陆"
					onClick={() => {
						Manager.getInstance().login(from.current.value, 'token', null, code => {
							if (code !== 0) {
								alert('登陆失败，请重试');
							}
						});
					}}
				/>
			)}
			{status === '登陆成功' && (
				<input
					type="button"
					value="注销"
					onClick={() => {
						Manager.getInstance().logout();
						Manager.getInstance().resetInitFlag();
						setStatus(null);
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
