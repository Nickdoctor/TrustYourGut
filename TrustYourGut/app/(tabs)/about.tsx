import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  Linking
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const screenWidth = Dimensions.get('window').width;

export default function AboutScreen() {
  const images = [
    require('@/assets/images/dev1.jpg'),
    require('@/assets/images/dev2.jpg'),
    require('@/assets/images/dev3.jpg'),
    require('@/assets/images/dev4.jpg'),
    require('@/assets/images/dev5.jpg'),
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      {/* ===== Developer Section ===== */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>About the Developer</Text>
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
        <Text style={styles.text}>
          Hello! My name is <Text style={styles.highlight}>Nicolas Gugliemo</Text>.
          I am the developer of this app! I’m a recent graduate from Sacramento State
          seeking a full-time position in software development.
        </Text>
        <Text style={styles.text}>
          If you have any questions, feedback, or suggestions, feel free to reach out
          using the links below. I’m always looking to improve my skills and make new connections!
        </Text>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <FontAwesome.Button
              style={styles.wideButton}
              name="github"
              backgroundColor="#000"
              onPress={() => Linking.openURL('https://github.com/Nickdoctor')}>
              GitHub
            </FontAwesome.Button>
          </View>
          <View style={styles.buttonWrapper}>
            <FontAwesome.Button
              style={styles.wideButton}
              name="linkedin"
              backgroundColor="#0c64c5"
              onPress={() => Linking.openURL('https://www.linkedin.com/in/nicolas-gugliemo-5776631b9/')}>
              LinkedIn
            </FontAwesome.Button>
          </View>

          <View style={styles.buttonWrapper}>
            <FontAwesome.Button
              style={styles.wideButton}
              name="user"
              backgroundColor="#eab676"
              onPress={() => Linking.openURL('https://portfolio-lac-delta-12.vercel.app/')}>
              Portfolio
            </FontAwesome.Button>
          </View>
        </View>
      </View>

      {/* ===== App Section ===== */}
      <View style={styles.card}>
        <Text style={styles.subHeader}>About Trust Your Gut</Text>
        <Image source={require('@/assets/images/icon.png')} style={styles.appImage} />
        <Text style={styles.text}>
          <Text style={styles.highlight}>Trust Your Gut</Text> is a food diary app designed
          to help you track your meals and identify potential food sensitivities that can be affecting your gut. By logging
          what you eat and how you feel, you can discover patterns that affect your well-being over time. The more entries you make,
          the better insights you can gain into your digestive health!
        </Text>
        <Text style={styles.text}>
          This app was an idea I had while studying computer science in college. I came up with the idea during a time in my studies where I knew what I wanted to make,
          however I did not have the knowledge to make it yet. Since graduating, I have been working on side projects, applying to jobs, and learning new skills hopefully start my
          career as a software developer.
        </Text>

        <Text style={styles.text}>
          Check out the science behind just how important gut health is to our overall well-being! ⬇️
        </Text>
        <View style={styles.buttonWrapper}>
          <FontAwesome.Button
            style={styles.wideButton}
            name="info"
            backgroundColor="#54191fff"
            onPress={() => Linking.openURL('https://www.hopkinsmedicine.org/health/wellness-and-prevention/the-brain-gut-connection')}>
            More Info
          </FontAwesome.Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#25292e',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#2a2b32',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 650,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  subHeader: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    color: '#d6d6d6',
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 10,
    textAlign: 'center',
  },
  highlight: {
    color: '#f8c471',
    fontWeight: '600',
  },
  image: {
    width: screenWidth - 60,
    height: 250,
    resizeMode: 'cover',
    borderRadius: 12,
    marginBottom: 20,
  },
  appImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    borderRadius: 20,
    marginBottom: 20,
  },
  dividerContainer: {
    marginVertical: 40,
    alignItems: 'center',
  },
  divider: {
    width: '60%',
    height: 2,
    backgroundColor: '#444',
    borderRadius: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
  },
  wideButton: {
    width: 230,
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,

  },
  buttonWrapper: {
    marginBottom: 12, // space between buttons
  },
});
