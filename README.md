# (SRT) IM client SDK with websocket

## 公用方法：

1. ### 初始化

   ```tsx
   public static getInstance(options?: WSOptions): IMClientManager
   
   // 参数如下
   export interface WSOptions {
   	wsUrl: string, //websocket url
   	wsProtocal?: string, //websocker协议
   	chatBaseCB?: ChatBaseCB, // 见下方
   	chatTransDataCB?: ChatTransDataCB, // 见下方
   	messageQoSCB?: MessageQoSCB, // 见下方
   }
   export interface ChatBaseCB {
       onLoginOrReloginSuccessCB?: () => void, // 登陆或重新登陆成功callback
       onLoginOrReloginFailCB?: () => void, // 登陆或重新登陆失败callback
       onLinkCloseMessageCB?: () => void // 网络连接失败callback
   }
   
   export interface ChatTransDataCB {
       onTransBufferCB?: (msg: Protocal) => void, // 收到其他客户端通用消息，消息格式见下方通用数据格式
       onTransErrorCB?: (params: object) => void // 收到服务端错误消息
   }
   
   export interface MessageQoSCB {
       handleMessageLost?: (messages: Array<Protocal>) => void, // 发送过程判断为丢包，丢包处理
       messagesBeReceivedCB?: (fingerPrint: string) => void // 服务端ack包（当发送包Qos=true时才有ack包，表示指纹为fp的数据包已被服务端接收）
   }
   
   ```

   e.g.

   ```tsx
   function onTransBufferCB(msg) {
   	const { fp, from, to, dataContent, typeu, sendTs } = msg;
   }
   function onTransErrorCB(params) {
   	const { errorCode, errorMsg } = params;
   }
   function handleMessageLost(lostMsgs: Array<Protocal>) {
     lostMsgs.forEach(msg=> {
       console.debug(msg);
     });
   }
   function messagesBeReceivedCB(fp: string) {
   	console.debug(fp);
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
    imSDK.getInstance(options);
   ```

   

2. ### 登陆

   ```tsx
    public login({
      loginUserId: string, //登陆方id
      loginToken: string, //应用层token，一般通过http请求登陆应用返回token，再用该token发送websocket的登陆请求
      app: string, //应用层项目名
      extra?: string, //其他参数
      callBack?: (code: number) => void //code === 0 表示客户端登陆包发送成功
    }): void
   ```

   e.g.: 

   ```tsx
    imSDK.getInstance().login({
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

   

3. ### 注销

   ```tsx
   //code === 0 表示客户端注销包发送成功
     public logout(callBack?: (code: number) => void): void 
   ```

   e.g.

   ```tsx
     imSDK.getInstance().logout();
   ```

   

4. ### 发送数据

   ```tsx
   public send({
      dataContent: string, //发送内容，内容为文本时为本身，为文件时由应用层定义规则并解析，比如定义为`${fp}|${fileName}|${fileType}|${fileKey}`
      toId: string, // 发送对象id
      Qos: boolean = true, //是否需要服务端ack，默认为true
      fingerPrint?: string, //消息报指纹，唯一id
      typeu: number = 0, // 单聊0，群聊1
      callBack?: (code: number, msg: Protocal) => void //code === 0 表示客户端发送成功，msg为发送包
   }): void
   ```

   e.g.

   ```tsx
   imSDK.getInstance().send({
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

5. ### 释放

   ```tsx
   public release(): void
   ```

   e.g.

   ```tsx
   imSDK.getInstance().release();
   ```



## 主要进程：

1. 主进程：

   ClientCoreSDK



2. 其他主要进程：

   AutoReLoginDaemon 自动登录进程

   KeepAliveDaemon 心跳进程（超时重启并启动自动登录进程）

   QoS4ReciveDaemon  消息接受质量保证进程（Qos接收处理）

   QoS4SendDaemon 消息发送质量保证进程 （Qos发送处理）



3. 其他封装：

   LocalWSDataReciever 消息接收处理，包括通用数据包、心跳包、登陆注销包等，

   LocalWSDataSender 消息发送处理

   LocalWSProvider websocket初始化，封装等



## 通用数据格式

| parameter                                                    | type    | description                                                  |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------ |
| fp                                                           | string  | 消息包的指纹特征码，为保证唯一使用uuid                       |
| bridge                                                       | boolean | 此字段暂时不用,默认传false                                   |
| typeu                                                        | int     | 客户端发送消息类型，0为单聊，1为群聊 , 非通用数据类型默认传-1 |
| type([type类型如下](https://www.shuruitech.net:3110/pages/editpage.action?pageId=28737639#id-开发文档-type类型)) | int     | 消息的类型                                                   |
| from                                                         | string  | 发送者的userId                                               |
| to                                                           | string  | 接受者的userId或groupId                                      |
| sendTs                                                       | long    | 消息的发送时间戳,由服务端生成,客户端默认不传此字段           |
| dataContent                                                  | string  | 协议数据内容,登录消息,ack,聊天信息等内容放在dataContent中传入 |

```tsx
//dataContent消息内容，内容为文本时为本身，为文件时由应用层定义规则并解析，比如定义为`${fp}|${fileName}|${fileType}|${fileKey}`，
//解析为
  const paramArray = dataContent.split('|');
    return {
      fp: paramArray[0] || '',
      name: paramArray[1] || '',
      type: paramArray[2] || DataType.TEXT,
      url: paramArray[3] || ''
  };
	export enum DataType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    AUDIO = 'AUDIO',
    FILE = 'FILE'
  }
```



## type类型

### 由客户端发出的消息类型

| type类型 | description                        |
| -------- | ---------------------------------- |
| 0        | 客户端登录                         |
| 1        | 心跳包                             |
| 2        | 通用数据                           |
| 3        | 客户端退出登录                     |
| 4        | Qos机制中的消息应答包              |
| 5        | C2S的回显指令,此指令目前仅用于测试 |



### 由服务端发出的消息类型

| type类型 | description                                                  |
| -------- | ------------------------------------------------------------ |
| 50       | 响应客户端登录                                               |
| 51       | 响应客户端的心跳包                                           |
| 52       | 反馈给客户端的错误信息[服务端错误类型](https://www.shuruitech.net:3110/pages/editpage.action?pageId=28737639#id-开发文档-服务端错误类型) |
| 53       | 反馈回显指令给客户端                                         |
| 54       | Qos机制中的消息应答包                                        |
| 2        | 转发客户端的通用数据                                         |

#### 服务端错误类型

##### response parameter

| parameter | type   | description |
| --------- | ------ | ----------- |
| errorCode | int    | error code  |
| errorMsg  | string | error msg   |

服务端返测错误内容放在dataContent中 

##### currentErrorCode

| errorCode | errorMsg                       | description              |
| --------- | ------------------------------ | ------------------------ |
| 301       | 本次发送的数据内容返回给客户端 | 客户端尚未登录请重新登录 |
| 302       | 本次发送的数据内容返回给客户端 | 服务器繁忙,降低发送频率  |
| 303       | group not exists               | 群聊指定的groupId不存在  |



## code类型

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



## 消息类型

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