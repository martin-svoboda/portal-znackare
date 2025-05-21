import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode
} from 'react';
import { apiRequest } from '../utils/apiClient';

declare global {
	interface Window {
		kct_portal?: any;
	}
}

type AuthContextType = {
	loggedIn: boolean;
	intAdr: string | null;
	getIntAdr: () => string | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [intAdr, setIntAdr] = useState<string | null>(null);

	// Při prvním načtení zkusit obnovit intAdr z localStorage
	useEffect(() => {
		const stored = localStorage.getItem('int_adr');
		if (stored) {
			setIntAdr(stored);
		} else {
			logout();
		}
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const data = await apiRequest<{ int_adr: string }>('/login', 'POST', {
				email,
				hash: password,
			});

			if (data.int_adr) {
				localStorage.setItem('int_adr', data.int_adr);
				setIntAdr(data.int_adr);
				return true;
			}

			throw new Error('Login failed: Missing int_adr');
		} catch (error: any) {
			console.error('Login error:', error);
			throw new Error(error?.message || 'Login failed');
		}
	};

	const logout = () => {
		localStorage.removeItem('int_adr');
		setIntAdr(null);
	};

	const getIntAdr = () => intAdr;

	const loggedIn = !!intAdr;

	return (
		<AuthContext.Provider value={{ loggedIn, intAdr, getIntAdr, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);

	if (!context) {
		console.error('AuthContext is undefined!');
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};
