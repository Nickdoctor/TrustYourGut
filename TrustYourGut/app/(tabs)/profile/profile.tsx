import { Text, View, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { Stack } from 'expo-router';
import { setShouldAnimateExitingForTag } from 'react-native-reanimated/lib/typescript/core';

export default function ProfileScreen() {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    console.log('Name submitted:', firstName, lastName, email, phoneNumber);
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Profile' }} />
        <Text style={styles.text}>Profile Screen</Text>
        <View style={styles.row}>
          <TextInput placeholder='Enter your First Name' style={styles.name} value={firstName} onChangeText={setFirstName} />
          <TextInput placeholder='Enter your Last Name' style={styles.name} value={lastName} onChangeText={setLastName} />
        </View>
        <TextInput textContentType='emailAddress' placeholder='Enter your Email' style={styles.email} value={email} onChangeText={setEmail} />
        <TextInput keyboardType='phone-pad' textContentType='telephoneNumber' placeholder='Enter your Phone Number' style={styles.phone} value={phoneNumber} onChangeText={setPhoneNumber} />
        <Button theme='picture' label='Change Profile Picture' onPress={() => router.navigate('/profile/ProfilePicture')} />
        <Button theme='primary' label='Save Changes' onPress={handleSubmit} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
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
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  name: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    width: '45%',
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 8,
  },
  email: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 8,
  },
  phone: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 8,
  }
});
