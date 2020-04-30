declare module '*.css';
declare module '*.png';
declare module '*.css';
declare module '*.less';
declare module '*.svg';
declare module '*.png';
declare module '*.json';

interface WebSocket {
    send(data: any): void;
    onMessage?: (CALLBACK) => void;
    onError?: (CALLBACK) => void;
}

interface SocketTask {
    onMessage: (CALLBACK) => void;
    send: (OBJECT) => void;
    close: () => void;
    onOpen: (CALLBACK) => void;
    onClose: (CALLBACK) => void;
    onError: (CALLBACK) => void;
    //自定义
    readyState?: number;
    readonly OPEN?:  number;
    readonly CONNECTING?: number;
    onmessage?: (CALLBACK) => void;
    onopen?: (CALLBACK) => void;
    onclose?: (CALLBACK) => void;
    onerror?: (CALLBACK) => void;
}

interface Uni {
    connectSocket: (options: {
        url: string,
        protocals?: Array<String>, 
        complete?: ()=>void
    }) => SocketTask;
    onSocketMessage?: (OBJECT) => void;
}