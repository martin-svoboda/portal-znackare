import {useAuth} from "./AuthContext";
import React, {useState} from "react";
import {
	TextInput,
	PasswordInput,
	Button,
	Paper,
	Title,
	Group,
	Stack,
	Checkbox,
	BackgroundImage,
	Flex,
	Box,
} from "@mantine/core";
import {notifications} from "@mantine/notifications";
import {useNavigate} from "react-router-dom";
import {Helmet} from "react-helmet-async";

type LoginFormProps = {
	onSuccess?: () => void;
};
const LoginForm: React.FC<LoginFormProps> = ({onSuccess}) => {
	const {login} = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const blogName = window.kct_portal?.bloginfo?.name

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const success = await login(email, password);
			if (success) {
				onSuccess?.();
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				notifications.show({
					color: 'red',
					title: `Chyba při přihlášení`,
					message: err.message,
					autoClose: 5000,
				});
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>Přihlášení | {blogName}</title>
				<meta name="description" content="Tento obsah je chráněný a vyžaduje přihlášení"/>
			</Helmet>

			<Flex h="calc(100vh - 60px)" w="calc(100% + 2rem)" style={{margin: '-1rem'}}>
				<Flex
					w={'100%'}
					maw={{base: '100%', lg: '40%'}}
					justify="center"
					align="center"
					p="xl"
				>
					<Paper w="100%" p="lg" maw={400}>
						<Title order={2} mb="md" ta="center">
							Vítejte v portálu značkaře!
						</Title>
						<form onSubmit={handleSubmit}>
							<Stack>
								<TextInput
									label="Email"
									placeholder="např. muj@email.cz"
									value={email}
									onChange={(e) => setEmail(e.currentTarget.value)}
									required
								/>
								<PasswordInput
									label="Heslo"
									value={password}
									onChange={(e) => setPassword(e.currentTarget.value)}
									required
								/>
								{/*<Checkbox label="Pamatovat si mě" size="md"/>*/}
								<Button type="submit" fullWidth loading={loading}>
									Přihlásit
								</Button>
							</Stack>
						</form>
						{window.kct_portal?.is_admin && (
							<Button
								mt="sm"
								variant="outline"
								color="gray"
								fullWidth
								onClick={() => {
									localStorage.setItem('int_adr', '4133');
									window.location.reload();
								}}
							>
								testovací přihlášení
							</Button>
						)}
					</Paper>
				</Flex>

				<Box w={'60%'} h="100%" visibleFrom="lg">
					<BackgroundImage
						src={window.kct_portal.settings?.login_image}
						h="100%"
						w="100%"
						style={{backgroundSize: 'cover', backgroundPosition: 'left'}}
					/>
				</Box>
			</Flex>
		</>
	);
};

export default LoginForm;
