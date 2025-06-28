import { Text, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

import ImageViewer from '@/components/ImageViewer';
import ProfilePictureButton from '@/components/ProfilePictureButton';

const PlaceholderImage = require('@/assets/images/profile.jpg');

export default function ProfilePictureScreen() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

  // Fetch stored profile image URL on mount
  useEffect(() => {
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
      } else if (data?.profile_picture_url) {
        // Add cache-busting query param
        setProfileImageUrl(`${data.profile_picture_url}?t=${Date.now()}`);
      }
    };

    fetchProfileImageUrl();
  }, []);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setSelectedImage(image.uri);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert('Not logged in.');
        return;
      }

      const userId = session.user.id;
      const fileExt = image.uri.split('.').pop();
      const filePath = `${userId}.jpg`;
      const fileBuffer = decode(image.base64 ?? '');

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        alert('Upload failed.');
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) {
          alert('Could not get public URL');
          return;
        }

        // Save clean URL to database
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ profile_picture_url: publicUrlData.publicUrl })
          .eq('id', userId);

        if (updateError) {
          console.error('Failed to update profile image url:', updateError);
        } else {
          // Add cache-busting query when displaying
          const cacheBustedUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
          setProfileImageUrl(cacheBustedUrl);
          setSelectedImage(undefined);
          alert('Image uploaded and profile updated!');
        }
      }
    } else {
      alert('You did not select any image.');
    }
  };

  const resetProfileImageUrl = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('Not logged in or error fetching session');
      return;
    }

    const userId = session.user.id;

    const { error } = await supabase
      .from('accounts')
      .update({ profile_picture_url: null })
      .eq('id', userId);


    if (error) {
      console.log('Error resetting profile image URL:', error);
    } else {
      setProfileImageUrl(undefined);
      console.log('Profile image URL reset successfully');
    }

    const { data, error: storageError } = await supabase
      .storage
      .from('avatars')
      .remove([`${userId}.jpg`])

    if (storageError) {
      console.error('Error deleting image from storage:', error);
    } else {
      console.log('Image deleted from storage:', data);
    }
  };

  const resetPhoto = () => {
    setSelectedImage(undefined);
    setProfileImageUrl(undefined);
    resetProfileImageUrl();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Change Profile Picture' }} />
      <Text style={styles.text}>Profile Picture Screen</Text>
      <View style={styles.imageContainer}>
        <ImageViewer
          key={selectedImage ?? profileImageUrl ?? 'placeholder'}
          imgSource={PlaceholderImage}
          selectedImage={selectedImage ?? profileImageUrl}
        />
      </View>
      <View style={styles.footerContainer}>
        <ProfilePictureButton theme="primary" label="Choose a photo" onPress={pickImageAsync} />
        <ProfilePictureButton label="Reset Photo" onPress={resetPhoto} />
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
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
