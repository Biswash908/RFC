import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';

const RawFeedingFAQScreen = () => {
  const rawFeedingFaqs = [
    {
      question: 'Why does the raw feeding diet exclude vegetables and fruits?',
      answer: 'Cats are obligate carnivores, meaning they thrive on a diet of animal-based proteins and fats. Vegetables and fruits can stress their digestive system and are not naturally part of their diet.',
    },
    {
      question: 'How do I transition my cat to a raw feeding diet?',
      answer: 'Start by introducing small amounts of raw food alongside their current diet, gradually increasing the raw food ratio over time.',
    },
    {
      question: 'What are the benefits of feeding whole prey?',
      answer: 'Whole prey provides natural teeth cleaning, higher taurine levels, and mimics the cat’s natural hunting experience, promoting overall well-being.',
    },
    {
      question: 'Can I feed ground raw food instead of whole cuts?',
      answer: 'While ground raw food is an option, it may lack the dental benefits of whole cuts. Be mindful that grinding can also reduce taurine levels.',
    },
    {
      question: 'Is it safe to feed live prey to my cat?',
      answer: 'No, feeding live prey is not recommended due to ethical concerns and potential harm to both the prey and your cat.',
    },
    {
      question: 'What are common sources of raw edible bones for my cat?',
      answer: 'Common sources include chicken wings, quail bones, and rabbit bones. Ensure the bones are soft and small enough for your cat to consume safely.',
    },
    {
      question: 'How do I know if my cat’s raw diet is nutritionally complete?',
      answer: 'Follow the 80:10:10 ratio for meat, raw edible bones, and organs. Providing a variety of proteins helps ensure a complete nutrient profile.',
    },
    {
      question: 'What should I do if my cat refuses to eat raw food?',
      answer: 'If your cat is hesitant, try introducing raw food gradually, mixing it with their current diet, or lightly searing the meat to enhance its aroma.',
    },
    {
        question: 'Are there any recipes for cats?',
        answer: 'This is a simple recipe that makes about 1KG and can be easily scaled up (suitable for freezing) or down to suit. You don’t need a grinder for this recipe.\n\n' +
        'Ingredients:\n' +
        '– 215 grams of chicken wings with tips, cut at the joints*\n' +
        '– 685 grams of any boneless meat except chicken breast or rabbit**, chunked or minced\n' +
        '– 100 grams of any liver\n\n' +
        'Instructions:\n' +
        'Mix all ingredients together.\n' +
        'The recipe is ready to serve!\n' +
        'It can be kept for 2-3 days in the fridge to ensure freshness.\n\n' +
        '** It’s not recommended to feed your cat chicken breast or rabbit, as they are both low in fat and taurine – an essential nutrient for your cat’s diet.'
      },
      {
        question: 'How much should I feed my cats?',
        answer: 'Kittens should be fed as much as they would eat (as they are still growing), ideally on a 75:15:10 ratio and adult cats should be fed 2-3% of their ideal body weight on a normal 80:10:10 ratio'
      },
  
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.container}>
        {rawFeedingFaqs.map((faq, index) => (
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

export default RawFeedingFAQScreen;
