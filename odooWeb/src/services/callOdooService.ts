import { JsonRpcPayload, JsonRpcResponse } from "../models/jsonModel.ts";


export async function callOdoo<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
): Promise<T> {
    const urlField = document.getElementById('urlOdoo') as HTMLInputElement | null;

    if (!urlField) {
        throw new Error('Champ URL introuvable');
    }

    const payload: JsonRpcPayload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            model,
            method,
            args,
            kwargs,
        },
        id: Math.floor(Math.random() * 1_000_000),
    };

    const endpoint = `${urlField.value.replace(/\/$/, '')}/web/dataset/call_kw`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data: JsonRpcResponse<T> = await response.json();

    if (data.error) {
        throw new Error(data.error.data?.message || data.error.message || 'Erreur inconnue');
    }

    if (typeof data.result === 'undefined') {
        throw new Error('Réponse invalide');
    }

    return data.result;
}
