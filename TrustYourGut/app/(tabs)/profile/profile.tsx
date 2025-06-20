import { Text, View, StyleSheet} from 'react-native';
import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker';
import {useState} from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { Stack } from 'expo-router'; 

export default function ProfileScreen() {

  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <Text style={styles.text}>Profile Screen</Text>
      <View style = {styles.footerContainer}>
        <Button theme = 'primary' label= 'Change Profile Picture' onPress={() => router.navigate('/profile/ProfilePicture')} />
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
