(SRT) IM client SDK with websocket


1. 初始化

   ```tsx
    public static getInstance(options?: WSOptions): IMClientManager
   ```

   e.g.

   ```tsx
    //收到其他客户端消息
    function onTransBufferCB(msg) {
		const { fp, from, dataContent, typeu, sendTs } = msg;
		//fp 消息报指纹，唯一id
		//from 消息发送方id
		//dataContent消息内容，内容为文本时为本身，为文件时由应用层定义规则并解析，比如定义为`${fp}|${fileName}|${fileType}|${fileKey}`
		//typeu 单聊0群聊1
		//sendTs 发送到服务器的时间
	}
    //收到服务端错误消息
    function onTransErrorCB(params) {
		const { errorCode, errorMsg } = params;
		setError(`errorCode: ${errorCode}\n errorMsg:${errorMsg}`);
	}
    //发送过程中丢包
	function handleMessageLost(lostMsgs: Array<object>) {
		setLostMsgs(lostMsgs.map((msg) => JSON.stringify(msg)).join(','));
	}
    //服务端ack包（当发送包Qos=true时）
    function messagesBeReceivedCB(fp: string) {
		setMsgBeReveived(fp);
	}
	
	const options: WSOptions = {
         wsUrl: WS_URL,
         chatBaseCB: {
            onLoginOrReloginSuccessCB: () => {
    			alert('登陆成功');
    		},
    		onLoginOrReloginFailCB: () => {
    			alert('登陆失败');
    		},
    		onLinkCloseMessageCB: () => {
    			alert('网络连接失败');
    		}
         },
         chatTransDataCB: {
            onTransBufferCB,
            onTransErrorCB
         },
         messageQoSCB: {
           handleMessageLost,
           messagesBeReceivedCB
         }
    };
   
    Manager.getInstance(options);
   ```

   

2. 登陆

   ```tsx
    public login({
      loginUserId: string, //登陆方id
      loginToken: string, //登陆方token
      app: string, //应用层项目名
      extra?: string, //其他参数
      callBack?: (code: number) => void //code === 0 表示登陆成功
    }): void
   ```

   e.g.: 

   ```tsx
    Manager.getInstance().login({
      loginUserId: '1',
      loginToken: 'token',
      app: 'test',
      callBack: (code) => {
   		if (code !== 0) {
		    alert('登陆失败，请重试');
		}
      }
    });
   ```

   

3. 注销

   ```tsx
   //code === 0 表示成功
     public logout(callBack?: (code: number) => void): void 
   ```

   e.g.

   ```tsx
     Manager.getInstance().logout();
   ```

   

4. 发送数据

   ```tsx
   public send({
      dataContent: string, //发送内容，内容为文本时为本身，为文件时由应用层定义规则并解析，比如定义为`${fp}|${fileName}|${fileType}|${fileKey}`
      toId: string, // 发送对象id
      Qos: boolean = true, //是否需要服务端ack
      fingerPrint?: string, //消息报指纹，唯一id
      typeu: number = 0, // 单聊0，群聊1
      callBack?: (code: number, msg: Protocal) => void //code === 0 表示发送成功，msg为发送包
   }): void
   ```

   e.g.

   ```tsx
   Manager.getInstance().send({
      dataContent: 'test message',
      toId: '2',
      callBack: (code, msg) => {
        console.debug(msg);
        if(code !== 0){
            alert('发送失败')
        }
      }
   });
   ```

5. 释放
   ```tsx
   public release(): void
   ```

   e.g.
   ```tsx
   Manager.getInstance().release();
   ```



6. 主进程：

   ClientCoreSDK



7. 其他主要进程：

   AutoReLoginDaemon 自动登录

   KeepAliveDaemon 心跳，超时重启并自动登录

   QoS4ReciveDaemon Qos接收处理，消息接受质量保证线程

   QoS4SendDaemon Qos发送处理，消息发送质量保证线程



8. 其他封装：

   LocalWSDataReciever 消息接收处理，包括通用数据包、心跳包、登陆注销包等，

   LocalWSDataSender 消息发送处理

   LocalWSProvider websocket初始化，封装等



9. code类型

   ​    COMMON_CODE_OK = 0,

   ​    COMMON_NO_LOGIN = 1,

   ​    COMMON_UNKNOW_ERROR = 2,

   ​    COMMON_DATA_SEND_FAILD = 3,

   ​    COMMON_INVALID_PROTOCAL = 4,

   

   ​    BREOKEN_CONNECT_TO_SERVER = 201,

   ​    BAD_CONNECT_TO_SERVER = 202,

   ​    CLIENT_SDK_NO_INITIALED = 203,

   ​    LOCAL_NETWORK_NOT_WORKING = 204,

   ​    TO_SERVER_NET_INFO_NOT_SETUP = 205,

   

   ​    RESPONSE_FOR_UNLOGIN = 301,



10. 消息类型

    ​    FROM_CLIENT_TYPE_OF_LOGIN = 0,

    ​    FROM_CLIENT_TYPE_OF_KEEP$ALIVE = 1,

    ​    FROM_CLIENT_TYPE_OF_COMMON$DATA = 2,

    ​    FROM_CLIENT_TYPE_OF_LOGOUT = 3,

    ​    FROM_CLIENT_TYPE_OF_RECIVED = 4,

    ​    FROM_CLIENT_TYPE_OF_ECHO = 5,

    

    ​    FROM_SERVER_TYPE_OF_RESPONSE$LOGIN = 50,

    ​    FROM_SERVER_TYPE_OF_RESPONSE$KEEP$ALIVE = 51,

    ​    FROM_SERVER_TYPE_OF_RESPONSE$FOR$ERROR = 52,

    ​    FROM_SERVER_TYPE_OF_RESPONSE$ECHO = 53,

    ​    FROM_SERVER_TYPE_OF_RESPONSE$RECIVED = 54
