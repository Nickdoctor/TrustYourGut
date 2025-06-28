import { Text, View, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl, Image as RNImage } from 'react-native';
import { Link } from 'expo-router';
import ImageViewer from '@/components/ImageViewer';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const PlaceholderImage = require('@/assets/images/profile.jpg');
  const placeholderUri = RNImage.resolveAssetSource(PlaceholderImage).uri;

  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  // Fetch profile picture URL on screen focus
  useFocusEffect(
    useCallback(() => {
      const fetchProfileImageUrl = async () => {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.log('Not logged in or error fetching session');
          return;
        }

        const userId = session.user.id;

        const { data, error } = await supabase
          .from('accounts')
          .select('profile_picture_url')
          .eq('id', userId)
          .single();

        if (error) {
          console.log('No profile image URL found');
          // Set to placeholder with cache busting
          setProfileImageUrl(`${placeholderUri}?t=${Date.now()}`);
        } else if (data?.profile_picture_url) {
          setProfileImageUrl(`${data.profile_picture_url}?t=${Date.now()}`);
          console.log('Profile image URL:', data.profile_picture_url);
        } else {
          // No URL found, show placeholder
          setProfileImageUrl(`${placeholderUri}?t=${Date.now()}`);
        }
      };

      fetchProfileImageUrl();
    }, [placeholderUri])
  );

  // Fetch user data function, reused for initial load and refresh
  const fetchUserData = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return;
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error.message);
    } else {
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setEmail(data.email);
      setPhoneNumber(data.phone_number + '');
      console.log('Fetched user data:', data);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return;
    }

    const userId = session.user.id;
    const { error: authError } = await supabase.auth.updateUser({ email });

    if (authError) {
      console.error('Error updating auth email:', authError.message);
      alert('Failed to update email: ' + authError.message);
      return;
    }

    const { data, error } = await supabase
      .from('accounts')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
      })
      .eq('id', userId)
      .select('first_name, last_name, email, phone_number')
      .single();

    if (error) {
      console.error('Error updating profile:', error.message);
      alert('Error updating profile: ' + error.message);
    } else {
      console.log('User data updated:', data);
      alert('Profile updated successfully!');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      router.replace('/auth/Register');
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    const [, area, middle, last] = match;
    if (area && !middle) return `(${area}`;
    if (area && middle && !last) return `(${area}) ${middle}`;
    if (area && middle && last) return `(${area}) ${middle}-${last}`;
    return value;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            <ImageViewer
              key={profileImageUrl} // Changing key forces remount and reload
              imgSource={PlaceholderImage}
              selectedImage={profileImageUrl}
              imageStyle={styles.profileImage}
            />
          </View>
          <Stack.Screen options={{ title: 'Profile' }} />
          <Text style={styles.text}>Profile Screen</Text>
          <View style={styles.row}>
            <View style={[styles.inputWithIconName, { marginLeft: 0 }]}>
              <FontAwesome name="user" size={20} color="#999" style={styles.icon} />
              <TextInput
                placeholder={'First Name'}
                placeholderTextColor="#888"
                style={styles.nameInput}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputWithIconName, { marginRight: 0 }]}>
              <FontAwesome name="user" size={20} color="#999" style={styles.icon} />
              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#888"
                style={styles.nameInput}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          <View style={styles.inputWithIcon}>
            <FontAwesome name="envelope" size={20} color="#999" style={styles.icon} />
            <TextInput
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="Enter your Email"
              placeholderTextColor="#888"
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWithIcon}>
            <FontAwesome name="phone" size={20} color="#999" style={styles.icon} />
            <TextInput
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              placeholder="Enter your Phone Number"
              placeholderTextColor="#888"
              style={styles.phoneInput}
              value={phoneNumber + ''}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
            />
          </View>

          <Button theme="picture" label="Change Profile Picture" onPress={() => router.navigate('/profile/ProfilePicture')} />
          <Button theme="primary" label="Save Changes" onPress={handleSubmit} />
          <Button theme="primary" label="Log Out" onPress={handleLogout} />
        </View>
      </ScrollView>
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
    flexGrow: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 20,
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
