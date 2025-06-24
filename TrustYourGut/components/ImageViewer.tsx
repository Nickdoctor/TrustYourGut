import { ImageSourcePropType, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

type Props = {
  imgSource: ImageSourcePropType;
  selectedImage? : string;
  imageStyle?: object;
};

export default function ImageViewer({ imgSource, selectedImage, imageStyle }: Props) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={[styles.image, imageStyle]} />;
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
// This component is used to display an image with a specific style.
// It takes an image source as a prop and applies styles to it.