import { useState } from 'react';

import { TouchableOpacity } from 'react-native';
import {
	Center,
	ScrollView,
	VStack,
	Skeleton,
	Text,
	Heading,
	useToast,
} from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { AppError } from '@utils/AppError';

const PHOTO_SIZE = 33;

type FormDataProps = {
	name: string;
	email: string;
	password: string;
	old_password: string;
	confirm_password: string;
};

const profileSchema = yup.object({
	name: yup.string().required('Informe o nome'),
	password: yup
		.string()
		.min(6, 'A senha deve ter pelo menos 6 dígitos.')
		.nullable()
		.transform((value) => (value ? value : null)),
	confirm_password: yup
		.string()
		.nullable()
		.transform((value) => (value ? value : null))
		.oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
		.when('password', {
			is: (Field: any) => Field,
			then: yup
				.string()
				.nullable()
				.required('Informe a confirmação da senha')
				.transform((value) => (value ? value : null)),
		}),
});

export function Profile() {
	const [isUpdating, setIsUpdating] = useState(false);
	const [photoIsLoading, setPhotoIsLoading] = useState(false);
	const [userPhoto, setUserPhoto] = useState('https://github.com/clertonf.png');

	const { user, updateUserProfile } = useAuth();

	const toast = useToast();
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormDataProps>({
		defaultValues: {
			name: user.name,
			email: user.email,
		},
		resolver: yupResolver(profileSchema),
	});

	async function handleUserPhotoSelect() {
		setPhotoIsLoading(true);
		try {
			const photoSelected = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 1,
				aspect: [4, 4],
				allowsEditing: true,
			});

			if (photoSelected.cancelled) {
				return;
			}

			if (photoSelected.uri) {
				const photoInfo = await FileSystem.getInfoAsync(photoSelected.uri);

				if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
					return toast.show({
						title: 'Essa imagem é muito grande. Escolha uma até de 5MB.',
						placement: 'top',
						bgColor: 'red.500',
					});
				}

				setUserPhoto(photoSelected.uri);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setPhotoIsLoading(false);
		}
	}

	async function handleProfileUpdate(data: FormDataProps) {
		try {
			setIsUpdating(true);

			const userUpdated = user;
			userUpdated.name = data.name;

			await api.put('/users', data);

			await updateUserProfile(userUpdated);

			toast.show({
				title: 'Perfil atualizado com sucesso',
				placement: 'top',
				bgColor: 'green.500',
			});
		} catch (error) {
			const isAppError = error instanceof AppError;

			const title = isAppError
				? error.message
				: 'Não foi possível atualizar os dados. Tente novamente mais tarde';

			setIsUpdating(false);

			toast.show({
				title,
				placement: 'top',
				bgColor: 'red.500',
			});
		} finally {
			setIsUpdating(false);
		}
	}

	return (
		<VStack flex={1}>
			<ScreenHeader title="Perfil" />

			<ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
				<Center mt={6} px={10}>
					{photoIsLoading ? (
						<Skeleton
							w={PHOTO_SIZE}
							h={PHOTO_SIZE}
							rounded="full"
							startColor="gray.400"
							endColor="gray.300"
						/>
					) : (
						<UserPhoto
							source={{ uri: userPhoto }}
							alt="Foto do usuário"
							size={PHOTO_SIZE}
						/>
					)}
					<TouchableOpacity onPress={handleUserPhotoSelect}>
						<Text
							color="green.500"
							fontWeight="bold"
							fontSize="md"
							mt={2}
							mb={8}
						>
							Alterar foto
						</Text>
					</TouchableOpacity>

					<Controller
						control={control}
						name="name"
						render={({ field: { value, onChange } }) => (
							<Input
								placeholder="Nome"
								bg="gray.600"
								onChangeText={onChange}
								value={value}
								errorMessage={errors.name?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="email"
						render={({ field: { value, onChange } }) => (
							<Input
								placeholder="E-mail"
								bg="gray.600"
								onChangeText={onChange}
								value={value}
								isDisabled
							/>
						)}
					/>

					<Heading
						color="gray.200"
						fontSize="md"
						mb={2}
						alignSelf="flex-start"
						mt={12}
						fontFamily="heading"
					>
						Alterar senha
					</Heading>

					<Controller
						control={control}
						name="old_password"
						render={({ field: { onChange } }) => (
							<Input
								bg="gray.600"
								placeholder="Senha antiga"
								onChangeText={onChange}
								secureTextEntry
							/>
						)}
					/>

					<Controller
						control={control}
						name="password"
						render={({ field: { onChange } }) => (
							<Input
								bg="gray.600"
								placeholder="Nova senha"
								onChangeText={onChange}
								secureTextEntry
								errorMessage={errors.password?.message}
							/>
						)}
					/>

					<Controller
						control={control}
						name="confirm_password"
						render={({ field: { onChange } }) => (
							<Input
								bg="gray.600"
								placeholder="Confirme a nova senha"
								onChangeText={onChange}
								secureTextEntry
								errorMessage={errors.confirm_password?.message}
							/>
						)}
					/>

					<Button
						title="Atualizar"
						mt={4}
						isLoading={isUpdating}
						onPress={handleSubmit(handleProfileUpdate)}
					/>
				</Center>
			</ScrollView>
		</VStack>
	);
}
