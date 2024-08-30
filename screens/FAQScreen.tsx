import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';

const FAQScreen = () => {
  const faqs = [
    {
      question: 'How does the raw feeding calculator app work?',
      answer: 'This app helps you manage and calculate your pet’s raw feeding diet by maintaining proper ratios of Meat, Bone, and Organs.',
    },
    {
      question: 'What information do I need to input into the app to calculate my cat’s diet?',
      answer: 'You can add the ingredients you have and the ratio of how much Meat, Bone, and Organ to feed your cat to calculate their diet.',
    },
    {
      question: 'How does the app determine the amount of raw food my cat needs?',
      answer: 'The app determines the amount of raw food for your cat by using the added ingredients and Meat: Bone: Organ ratio to feed.',
    },
    {
      question: 'Can I customise the app’s recommendations based on my cat’s specific needs?',
      answer: 'Yes, you can adjust the ratio as per your cat\'s needs and weight.',
    },
    {
      question: 'What if my cat has specific dietary restrictions or allergies?',
      answer: 'You can choose to not add the ingredients your cat is allergic to.',
    },
    {
      question: 'Does the app provide guidance on sourcing and preparing raw food?',
      answer: 'No, it does not yet.',
    },
    {
      question: 'Can the app calculate meal plans for multiple cats?',
      answer: 'No, you cannot add multiple cats to calculate their meals but you can calculate their meals seperately or give them the same food if they have the same requirements.',
    },
    {
      question: 'How often should I update my cat’s information in the app?',
      answer: 'You only need to update the ratio to feed them when necessary.',
    },
    {
      question: 'Can I use the app to track my cat’s weight and health over time?',
      answer: 'No, the app cannot track your cat\'s weight or health changes.',
    },
    {
      question: 'Can I save my feeding plans?',
      answer: 'No, you cannot save your feeding plans yet. It may be added in future updates.',
    },

    {
      question: 'How can I submit a feature suggestion or give feedback about the app?',
      answer: 'You can send an email to support@makethingsunlimited.com.',
    },
    
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.container}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqContainer}>
            <Text style={styles.question}>{faq.question}</Text>
            <Text style={styles.answer}>{faq.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    padding: 16,
  },
  faqContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    color: '#666',
  },
});

export default FAQScreen;
