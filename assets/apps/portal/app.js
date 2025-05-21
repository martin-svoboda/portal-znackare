import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-react-table/styles.css';

import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import {AuthProvider} from './context/AuthContext';
import {Button, MantineProvider} from '@mantine/core';
import {Notifications} from '@mantine/notifications';
import apiFetch from '@wordpress/api-fetch';

if (window.kct_portal?.nonce) {
	apiFetch.use(apiFetch.createNonceMiddleware(window.kct_portal.nonce));
}

document.addEventListener('DOMContentLoaded', () => {
	if (!window.kct_portal) {
		console.error("Konfigurace kct_portal nebyla nalezena.");
		return;
	}

	const rootElement = document.querySelector('[data-app="portal"]');
	if (!rootElement) {
		console.error("Element #app-root nebyl nalezen.");
		return;

	}

	if (rootElement && window.kct_portal) {
		const queryClient = new QueryClient();
		ReactDOM.render(
			<QueryClientProvider client={queryClient}>
				<HelmetProvider>
					<AuthProvider>
						<BrowserRouter>
							<MantineProvider withNormalizeCSS withGlobalStyles>
								<Notifications/>
								<App/>
							</MantineProvider>
						</BrowserRouter>
					</AuthProvider>
				</HelmetProvider>
			</QueryClientProvider>,
			rootElement
		);
	}
});
