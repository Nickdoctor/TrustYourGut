import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import ProfilePictureButton from '@/components/ProfilePictureButton';
import * as ImagePicker from 'expo-image-picker';
import {useState} from 'react';
import { Stack } from 'expo-router';

const PlaceholderImage = require('@/assets/images/profile.jpg'); 

export default function ProfilePictureScreen() {

  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert('You did not select any image.');
    }
  };

 const resetPhoto = () => {
  setSelectedImage(undefined);
};

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Change Profile Picture'}} />
      <Text style={styles.text}>Profile Picture Screen</Text>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage}/>
      </View>
      <View style = {styles.footerContainer}>
        <ProfilePictureButton theme="primary" label= "Choose a photo" onPress={pickImageAsync} />
        <ProfilePictureButton label = "Reset Photo" onPress={resetPhoto} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
