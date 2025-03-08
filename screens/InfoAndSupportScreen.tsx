import React, { useLayoutEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Linking } from 'react-native';

const InfoAndSupportScreen = ({ navigation }) => {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@makethingsunlimited.com');
  };

  const handleAppFaqsPress = () => {
    navigation.navigate('FAQScreen'); // Navigate to the App FAQs
  };

  const handleRawFeedingFaqsPress = () => {
    navigation.navigate('RawFeedingFAQScreen'); // Navigate to the Raw Feeding FAQs
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Info & Support' });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Terms and Conditions and Privacy Policy Section */}
        <TouchableOpacity style={styles.listItem} onPress={() => openLink('http://makethingsunlimited.com/terms-and-conditions/')}>
          <View style={styles.iconContainer}>
            <FontAwesome name="file-text-o" size={24} color="#000080" style={styles.icon} />
          </View>
          <Text style={styles.listItemText}>Terms and Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem} onPress={() => openLink('http://makethingsunlimited.com/privacy-policy/')}>
          <View style={styles.iconContainer}>
            <FontAwesome name="lock" size={24} color="#000080" style={styles.icon} />
          </View>
          <Text style={styles.listItemText}>Privacy Policy</Text>
        </TouchableOpacity>

        {/* Contact Section */}
        <TouchableOpacity style={styles.listItem} onPress={handleEmailPress}>
          <View style={styles.iconContainer}>
            <FontAwesome name="envelope" size={24} color="#000080" style={styles.icon} />
          </View>
          <Text style={styles.listItemText}>Send us an Email</Text>
        </TouchableOpacity>

        {/* FAQ Section */}
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
  listItemText: {
    fontSize: 18,
    color: 'black',
  },
  iconContainer: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default InfoAndSupportScreen;
