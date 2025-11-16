export interface JsonRpcResult {
    result?: {
        session_id: string;
        uid: number;
    };
    error?: {
        message?: string;
        data?: {
            message?: string;
        };
    };
}

export interface JsonRpcPayload {
    jsonrpc: '2.0';
    method: 'call';
    params: Record<string, unknown>;
    id: number;
}

export interface JsonRpcResponse<T = unknown> {
    result?: T;
    error?: {
        message?: string;
        data?: { message?: string };
    };
}

