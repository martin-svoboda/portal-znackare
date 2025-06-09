import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode
} from 'react';
import { apiRequest } from '../shared/api';

type User = {
	INT_ADR: string;
	Jmeno: string;
	Prijmeni: string;
	// ...doplň další potřebná pole
	[K: string]: any; // zbytek volitelně
};

type AuthContextType = {
	loggedIn: boolean;
	intAdr: string | null;
	user: User | null;
	getIntAdr: () => string | null;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => void;
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [intAdr, setIntAdr] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);

	// Při prvním načtení zkusit obnovit intAdr z localStorage
	useEffect(() => {
		const stored = localStorage.getItem('int_adr');
		if (stored) {
			setIntAdr(stored);
		} else {
			logout();
		}
	}, []);

	// Jakmile máme intAdr, pokusíme se natáhnout uživatele (poprvé i po loginu)
	useEffect(() => {
		if (intAdr) {
			refreshUser();
		} else {
			setUser(null);
		}
		// eslint-disable-next-line
	}, [intAdr]);

	const refreshUser = async () => {
		if (!intAdr) return;
		try {
			const result = await apiRequest('/user', 'GET', { int_adr: intAdr });
			// Pokud API vrací pole, vezmeme první záznam
			if (Array.isArray(result) && result.length > 0) {
				setUser(result[0]);
			} else if (result && typeof result === 'object') {
				setUser(result);
			} else {
				setUser(null);
			}
		} catch (err: any) {
			console.error('Failed to fetch user:', err);
			setUser(null);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const data = await apiRequest<{ int_adr: string }>('/login', 'POST', {
				email,
				hash: password,
			});

			if (data.int_adr) {
				localStorage.setItem('int_adr', data.int_adr);
				setIntAdr(data.int_adr);
				// refreshUser proběhne přes useEffect
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
		setUser(null);
	};

	const getIntAdr = () => intAdr;

	const loggedIn = !!intAdr;

	return (
		<AuthContext.Provider value={{ loggedIn, intAdr, user, getIntAdr, login, logout, refreshUser }}>
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
