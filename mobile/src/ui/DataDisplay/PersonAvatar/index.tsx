import { Image, Text, View } from 'react-native';

type PersonAvatarProps = {
  name: string;
  photoUri?: string;
  size?: 'sm' | 'md';
};

const sizeClass = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
} as const;

export function PersonAvatar({ name, photoUri, size = 'md' }: PersonAvatarProps) {
  const dimension = sizeClass[size];
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (photoUri) {
    return (
      <Image
        accessibilityLabel={name}
        className={`${dimension} rounded-full`}
        source={{ uri: photoUri }}
      />
    );
  }

  return (
    <View className={`${dimension} items-center justify-center rounded-full bg-serenity-green/15`}>
      <Text className={`font-sans-semibold text-serenity-green ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
        {initial}
      </Text>
    </View>
  );
}
