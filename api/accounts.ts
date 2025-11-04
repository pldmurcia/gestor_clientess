import { put, list } from '@vercel/blob';
import type { Account } from '../types';

const BLOB_PATHNAME = 'accounts.json';

/**
 * Fetches the current list of accounts from Vercel Blob storage.
 * If the blob doesn't exist, it returns an empty array.
 */
async function getAccountsFromBlob(): Promise<Account[]> {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    
    if (blobs.length === 0 || !blobs[0]) {
        return [];
    }

    const blob = blobs[0];
    const response = await fetch(blob.url);
    if (!response.ok) {
        console.error(`Failed to fetch blob content from ${blob.url}. Status: ${response.status}`);
        throw new Error('Could not retrieve account data from storage.');
    }

    try {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Error parsing JSON from blob:", e);
        // If JSON is malformed, treat it as if there are no accounts.
        return [];
    }
}

export default async function handler(req: Request) {
    try {
        if (req.method === 'GET') {
            const accounts = await getAccountsFromBlob();
            return new Response(JSON.stringify(accounts), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // For all write operations, we read, modify, then write back.
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            let accounts = await getAccountsFromBlob();

            if (req.method === 'POST') {
                const newAccount = await req.json() as Account;
                accounts.push(newAccount);
            }
            
            if (req.method === 'PUT') {
                const updatedAccount = await req.json() as Account;
                const accountIndex = accounts.findIndex(acc => acc.id === updatedAccount.id);
                if (accountIndex === -1) {
                    return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404 });
                }
                accounts[accountIndex] = updatedAccount;
            }
            
            if (req.method === 'DELETE') {
                const { id } = await req.json() as { id: string };
                if (!id) {
                    return new Response(JSON.stringify({ error: 'Account ID is required' }), { status: 400 });
                }
                const initialLength = accounts.length;
                accounts = accounts.filter(acc => acc.id !== id);

                if (accounts.length === initialLength) {
                    return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404 });
                }
            }
            
            // Write the updated accounts array back to the blob
            await put(BLOB_PATHNAME, JSON.stringify(accounts, null, 2), {
                access: 'public', // The blob URL is public, but the API endpoint to write is not.
                contentType: 'application/json',
            });
            
            return new Response(JSON.stringify({ success: true, accounts }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("API Error in /api/accounts:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(JSON.stringify({ details: `Server error: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
