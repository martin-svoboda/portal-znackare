import React, {useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import LoginForm from './LoginForm';

type RequireLoginProps = {
	required?: boolean;
	children: React.ReactNode;
	onLoginSuccess?: () => void;
};

const RequireLogin: React.FC<RequireLoginProps> = ({
													   required = true,
													   children,
													   onLoginSuccess,
												   }) => {
	const {loggedIn} = useAuth();

	if (!required) {
		return <>{children}</>;
	}

	if (!loggedIn) {
		return <LoginForm onSuccess={onLoginSuccess}/>;
	}

	return <>{children}</>;
};

export default RequireLogin;
