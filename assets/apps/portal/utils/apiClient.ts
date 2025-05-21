import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export async function apiRequest<T = any>(
	endpoint: string,
	method: 'GET' | 'POST' = 'GET',
	data?: Record<string, any>
): Promise<T> {
	try {
		let path = window.kct_portal.rest_namespace + endpoint;
		const options: any = {
			method,
			headers: {
				'X-WP-Nonce': window.kct_portal.nonce,
			},
		};
		if (method === 'GET' && data) {

			path = addQueryArgs(path, data);
		} else if (method !== 'GET') {
			options.data = data;
		}
		console.log('call API:', path)

		return await apiFetch({ path, ...options });
	} catch (error: any) {
		console.error(`API error at ${endpoint}:`, error);
		throw error;
	}
}
