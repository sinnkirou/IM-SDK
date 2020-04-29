(SRT) IM client SDK with websocket

1. 初始化

   ```tsx
   public static getInstance(options?: WSOptions): IMClientManager
   ```

   e.g.

   ```tsx
   const options: WSOptions = {
     wsUrl: WS_URL,
   
     chatBaseCB: {
   
         onLoginOrReloginSuccessCB,
   
         onLoginOrReloginFailCB,
   
         onLinkCloseMessageCB
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
   //code === 0 表示成功
   public login({
      logiUserId: string,
      loginToken: string,
      app: string,
      extra?: string,
      callBack?: (code: number) => void }): void
   ```

   e.g.: 

   ```tsx
   Manager.getInstance().login({
      logiUserId: id,
      loginToken: token,
      app: 'test',
      callBack: (code) => {
   			if (callBack) { callBack(code); }
      }
   });
   ```

   

3. 注销

   ```tsx
   public logout(callBack?: (code: number) => void): void 
   ```

   e.g.

   ```tsx
   Manager.getInstance().logout();
   ```

   

4. 发送数据

   ```tsx
   //code === 0 表示成功
   public send({
      dataContent: string,
      toId: string,
      Qos: boolean = true,
      fingerPrint?: string,
      typeu: number = 0,
      callBack?: (code: number) => void
   }): void
   ```

   e.g.

   ```tsx
   const msg: IMessage = payload.message;
   Manager.getInstance().send({
      dataContent: msg.dataContent,
      toId: String(msg.to),
      fingerPrint: msg.fp,
      callBack: (code, msg) => {
         if (payload.handleSendResult) {
            payload.handleSendResult(code);
            console.debug(msg);
         }
      }
   });
   ```

5. 释放

   public release(): void

   e.g.

   Manager.getInstance().release();



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
