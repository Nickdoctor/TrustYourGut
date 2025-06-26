import { Text, View, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { Stack } from 'expo-router';
import { setShouldAnimateExitingForTag } from 'react-native-reanimated/lib/typescript/core';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';


export default function ProfileScreen() {
  const PlaceholderImage = require('@/assets/images/profile.jpg');
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    console.log('Name submitted:', firstName, lastName, email, phoneNumber);
  }
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      router.replace('/auth/Register');
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} imageStyle={styles.profileImage} />
          </View>
          <Stack.Screen options={{ title: 'Profile' }} />
          <Text style={styles.text}>Profile Screen</Text>
          <View style={styles.row}>
            <View style={[styles.inputWithIconName, { marginLeft: 0 }]}>
              <FontAwesome name="user" size={20} color="#999" style={styles.icon} />
              <TextInput placeholder='First Name' placeholderTextColor="#888" style={styles.nameInput} value={firstName} onChangeText={setFirstName} />
            </View>
            <View style={[styles.inputWithIconName, { marginRight: 0 }]}>
              <FontAwesome name="user" size={20} color="#999" style={styles.icon} />
              <TextInput placeholder='Last Name' placeholderTextColor="#888" style={styles.nameInput} value={lastName} onChangeText={setLastName} />
            </View>
          </View>
          <View style={styles.inputWithIcon}>
            <FontAwesome name="envelope" size={20} color="#999" style={styles.icon} />
            <TextInput keyboardType='email-address' textContentType='emailAddress' placeholder='Enter your Email' placeholderTextColor="#888" style={styles.emailInput} value={email} onChangeText={setEmail} />
          </View>

          <View style={styles.inputWithIcon}>
            <FontAwesome name="phone" size={20} color="#999" style={styles.icon} />
            <TextInput keyboardType='phone-pad' textContentType='telephoneNumber' placeholder='Enter your Phone Number' placeholderTextColor="#888" style={styles.phoneInput} value={phoneNumber} onChangeText={setPhoneNumber} />
          </View>

          <Button theme='picture' label='Change Profile Picture' onPress={() => router.navigate('/profile/ProfilePicture')} />
          <Button theme='primary' label='Save Changes' onPress={handleSubmit} />
          <Button theme='primary' label='Log Out' onPress={handleLogout} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff', // Light background for contrast
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Optional: border for extra pop
    borderWidth: 1,
    borderColor: '#ffd33d',
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    overflow: 'hidden', // This ensures circular clipping
    alignSelf: 'center', // Center the image in the card
    marginBottom: 20, // Optional spacing below image

  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
  },
  inputWithIconName: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  nameInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
    //width: '45%',
  },
  emailInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    resizeMode: 'cover',
  },
});
