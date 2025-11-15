let sessionId: string | null = null;
let uid: number | null = null;

export const authState = {
    get sessionId(): string | null {
        return sessionId;
    },
    get uid(): number | null {
        return uid;
    },
};

interface JsonRpcResult {
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

export async function authenticate(): Promise<boolean> {
    const urlField = document.getElementById('urlOdoo') as HTMLInputElement | null;
    const dbField = document.getElementById('dbOdoo') as HTMLInputElement | null;
    const userField = document.getElementById('userOdoo') as HTMLInputElement | null;
    const passwordField = document.getElementById('passwordOdoo') as HTMLInputElement | null;

    if (!urlField || !dbField || !userField || !passwordField) {
        console.error('Impossible de récupérer les champs.');
        return false;
    }

    const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
            db: dbField.value.trim(),
            login: userField.value.trim(),
            password: passwordField.value,
        },
        id: Math.floor(Math.random() * 1_000_000),
    };

    const endpoint = `${urlField.value.replace(/\/$/, '')}/web/session/authenticate`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data: JsonRpcResult = await response.json();

        if (data.error) {
            throw new Error(data.error.data?.message || data.error.message || 'Erreur inconnue');
        }

        if (!data.result) {
            throw new Error('Réponse invalide');
        }

        sessionId = data.result.session_id;
        uid = data.result.uid;

        return true;
    } catch (error) {
        sessionId = null;
        uid = null;
        console.error('Erreur lors de l’authentification :', error);
        return false;
    }
}
