import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/Button';

const PlaceholderImage = require('../../assets/images/profile.jpg'); 

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage}/>
      </View>
      <View style = {styles.footerContainer}>
        <Button theme="primary" label= "Choose a photo" />
        <Button label = "Use this photo" />
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
