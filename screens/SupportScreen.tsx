import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SupportScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@makethingsunlimited.com');
  };

  const handleAppFaqsPress = () => {
    navigation.navigate('FAQScreen'); // Navigate to the App FAQs
  };

  const handleRawFeedingFaqsPress = () => {
    navigation.navigate('RawFeedingFAQScreen'); // Navigate to the Raw Feeding FAQs
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <FontAwesome name="headphones" size={64} color="#1252b8" />
          <Text style={styles.contactText}>Contact Us</Text>
        </View>

        <TouchableOpacity style={styles.listItem} onPress={handleEmailPress}>
          <View style={styles.iconContainer}>
            <FontAwesome name="envelope" size={24} color="#000080" style={styles.icon} />
          </View>
          <Text style={styles.listItemText}>Send us an Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem} onPress={handleAppFaqsPress}>
          <View style={styles.iconContainer}>
            <FontAwesome name="question-circle" size={24} color="#000080" style={styles.icon} />
          </View>
          <Text style={styles.listItemText}>App FAQs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem} onPress={handleRawFeedingFaqsPress}>
          <View style={styles.iconContainer}>
            <FontAwesome name="cutlery" size={24} color="#000080" style={styles.icon} />
          </View>
          <Text style={styles.listItemText}>Raw Feeding FAQs</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  contactText: {
    fontSize: 24,
    color: '#000080',
    fontWeight: 'bold',
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  icon: {
    marginRight: 12,
  },
  iconContainer: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    fontSize: 18,
    color: 'black',
  },
});

export default SupportScreen;
