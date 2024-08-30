import React, { useLayoutEffect } from 'react';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Linking } from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Info' });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
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
    width: 33, // Set a consistent width for the icon container
    alignItems: 'center',
    justifyContent: 'center', // Center the icon vertically and horizontally
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000080',
    paddingVertical: 5,
  },
  bottomBarItem: {
    alignItems: 'center',

  },
  bottomBarText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
});

export default SettingsScreen;
