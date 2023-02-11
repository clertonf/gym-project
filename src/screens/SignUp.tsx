import { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import {
	VStack,
	Image,
	Text,
	Center,
	Heading,
	ScrollView,
	KeyboardAvoidingView,
	useToast,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { useAuth } from '@hooks/useAuth';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

type FormDataProps = {
	name: string;
	email: string;
	password: string;
	password_confirm: string;
};

const signUpSchema = yup.object({
	name: yup.string().required('Informe o nome.'),
	email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
	password: yup
		.string()
		.required('Informe a senha.')
		.min(6, 'A senha deve ter pelo menos 6 digitos.'),
	password_confirm: yup
		.string()
		.required('Confirme a senha.')
		.oneOf([yup.ref('password'), null], 'A confirmação da senha não confere'),
});

export function SignUp() {
	const [isLoading, setIsLoading] = useState(false);

	const { signIn } = useAuth();

	const navigation = useNavigation();
	const toast = useToast();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormDataProps>({
		resolver: yupResolver(signUpSchema),
	});

	function handleGoBack() {
		navigation.goBack();
	}

	async function handleSignUp({ name, email, password }: FormDataProps) {
		try {
			setIsLoading(true);

			await api.post('/users', { name, email, password });
			await signIn(email, password);
		} catch (error) {
			setIsLoading(false);
			const isAppError = error instanceof AppError;
			const messageError = isAppError
				? error.message
				: 'Não foi possível criar a conta. Tente novamente mais tarde';

			toast.show({
				title: messageError,
				placement: 'top',
				bgColor: 'red.500',
			});
		}
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView>
				<ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					backgroundColor="gray.700"
					showsVerticalScrollIndicator={false}
				>
					<VStack flex={1} px={10}>
						<Image
							source={BackgroundImg}
							defaultSource={BackgroundImg}
							alt="Pessoas treinando"
							resizeMode="contain"
							position="absolute"
						/>

						<Center my={24}>
							<LogoSvg />
							<Text color="gray.100" fontSize="md">
								Treine sua mente e seu corpo
							</Text>
						</Center>

						<Center>
							<Heading
								color="gray.100"
								fontSize="xl"
								mb={6}
								fontFamily="heading"
							>
								Crie sua conta
							</Heading>

							<Controller
								control={control}
								name="name"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="Nome"
										onChangeText={onChange}
										value={value}
										autoCorrect={false}
										errorMessage={errors.name?.message}
									/>
								)}
							/>

							<Controller
								control={control}
								name="email"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="E-mail"
										keyboardType="email-address"
										autoCapitalize="none"
										autoCorrect={false}
										onChangeText={onChange}
										value={value}
										errorMessage={errors.email?.message}
									/>
								)}
							/>

							<Controller
								control={control}
								name="password"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="Senha"
										secureTextEntry
										onChangeText={onChange}
										value={value}
										errorMessage={errors.password?.message}
									/>
								)}
							/>

							<Controller
								control={control}
								name="password_confirm"
								render={({ field: { onChange, value } }) => (
									<Input
										placeholder="Confirme a Senha"
										secureTextEntry
										onChangeText={onChange}
										value={value}
										onSubmitEditing={handleSubmit(handleSignUp)}
										returnKeyType="send"
										errorMessage={errors.password_confirm?.message}
									/>
								)}
							/>

							<Button
								title="Criar e acessar"
								onPress={handleSubmit(handleSignUp)}
								isLoading={isLoading}
							/>
						</Center>

						<Center flex={1} justifyContent="flex-end" mt={10} mb={12}>
							<Button
								title="Voltar para o login"
								variant="outline"
								onPress={handleGoBack}
							/>
						</Center>
					</VStack>
				</ScrollView>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}
