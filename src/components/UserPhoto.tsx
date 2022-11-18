import React from "react";

import { Image, IImageProps } from 'native-base';

type ImageProps = IImageProps & {
  size: number;
}

export function UserPhoto({ size, ...rest }: ImageProps) {
  return (
    <Image
      w={size}
      h={size}
      rounded='full'
      borderWidth={2}
      borderColor='gray.400'
      {...rest}
    />
  )
}
