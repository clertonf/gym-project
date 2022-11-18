import React  from 'react';

import { Heading, HStack, Icon, Text, VStack, Image, Box } from "native-base";
import { TouchableOpacity } from 'react-native';
import { Feather } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native';

import BodySVG from "@assets/body.svg";
import SeriesSVG from "@assets/series.svg";
import RepetitionsSVG from "@assets/repetitions.svg";
import { Button } from '@components/Button';

export function Exercise() {
  const navigation = useNavigation();

  function handleGoBack()  {
    navigation.goBack();
  }

  return(
    <VStack flex={1}>
      <VStack px={8} bg='gray.600' pt={12}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon
            as={Feather}
            name='arrow-left'
            color='green.500'
            size={6}
          />
        </TouchableOpacity>

        <HStack mt={4} mb={8} justifyContent='space-between' alignItems='center'>
          <Heading color='gray.100' fontSize='lg' flexShrink={1} fontFamily='heading'>
            Puxada frontal
          </Heading>

          <HStack alignItems='center'>
            <BodySVG />
            <Text color='gray.200' ml={1} textTransform='capitalize'>
              Costas
            </Text>
          </HStack>
        </HStack>
      </VStack>

      <VStack p={8}>
        <Image
          w='full'
          h='80'
          source={{ uri: 'https://www.origym.com.br/upload/remada-unilateral-3.png' }}
          alt='Nome do exercício'
          mb={3}
          resizeMode='cover'
          rounded='lg'
        />

        <Box bg='gray.600' rounded='md' pb={4} px={4}>
          <HStack alignItems='center' justifyContent='space-around' mb={6} mt={5}>
            <HStack>
              <SeriesSVG />
              <Text color='gray.200' ml={2}>
                3 séries
              </Text>
            </HStack>

            <HStack>
              <SeriesSVG />
              <Text color='gray.200' ml={2}>
                3 séries
              </Text>
            </HStack>
          </HStack>

          <Button
            title='Marcar como realizado'
          />
        </Box>
      </VStack>
    </VStack>
  )
}
