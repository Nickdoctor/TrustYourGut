import { Text, View, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl, Image, FlatList, Dimensions, Linking } from 'react-native';
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


const screenWidth = Dimensions.get('window').width;

export default function AboutScreen() {

  const [refreshing, setRefreshing] = useState(false);
  const images = [
    require('@/assets/images/dev1.jpg'),
    require('@/assets/images/dev2.jpg'),
    require('@/assets/images/dev3.jpg'),
    require('@/assets/images/dev4.jpg'),
    require('@/assets/images/dev5.jpg')
  ];


  const onRefresh = () => {
    setRefreshing(true);
    setRefreshing(false);
  }



  return (
    <ScrollView
      contentContainerStyle={styles.container}
      //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>About Trust Your Gut</Text>
      <Text style={styles.text}>
        Trust Your Gut is a food diary app designed to help you track your meals and identify potential food sensitivities.
        By logging your food intake and any symptoms you experience, you can gain insights into how different foods affect your body.
      </Text>
      <Text style={styles.text}>
        The app allows you to easily add food entries, view your history, and analyze patterns over time.
        Whether you're managing a specific condition or simply want to improve your overall health, Trust Your Gut is here to support you.
      </Text>

      <Text style={styles.subHeader}>About the Developer</Text>

      <View style={styles.image}>
        <FlatList
          data={images}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={item} style={styles.image} />
          )}
        />
      </View>
      <Text style={styles.text}>
        This app was developed by a passionate individual who believes in the power of food to impact our health.
        With a background in software development and a keen interest in nutrition, the developer aims to create tools that empower users to take control of their well-being.
      </Text>
      <Text style={styles.text}>
        If you have any questions, feedback, or suggestions, feel free to reach out from the links below.
        Your input is invaluable in making Trust Your Gut even better!
      </Text>
      <View style={styles.row}>
        <FontAwesome.Button  style={styles.wideButton} name="github" backgroundColor="black" onPress={() => {
          Linking.openURL('https://github.com/Nickdoctor');}}>
          Github
        </FontAwesome.Button>
      </View>
      <View style={styles.row}>
        <FontAwesome.Button  style={styles.wideButton} name="linkedin" backgroundColor="#0c64c5" onPress={() => {
          Linking.openURL('https://www.linkedin.com/in/nicolas-gugliemo-5776631b9/');}}>
          LinkedIn
        </FontAwesome.Button>
      </View>
      <View style={styles.row}>
        <FontAwesome.Button  style={styles.wideButton} name="user" backgroundColor="#eab676" onPress={() => {
          Linking.openURL('https://portfolio-lac-delta-12.vercel.app/');}}>
          Portfolio
        </FontAwesome.Button>
      </View>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 100, // Space for top content like header
    paddingHorizontal: 20,
    backgroundColor: '#25292e',
    alignItems: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    maxWidth: 600,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  subHeader: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  image: {
    width: screenWidth,
    height: 350,
    resizeMode: 'cover',
  },
  icon: {
    marginRight: 8,
  },
  wideButton:{
  width: 250, // or '80%', or screenWidth - padding
  justifyContent: 'center', // centers label inside
  }
});
