import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';

const RawFeedingFAQScreen = () => {
  const rawFeedingFaqs = [
    {
      question: 'Why does the raw feeding diet include vegetables and fruits?',
      answer: 'The inclusion of vegetables and fruits in a raw feeding diet for dogs is essential for providing a range of vitamins, minerals, and fiber. While dogs are primarily carnivores, small amounts of plant matter can aid in digestion, provide antioxidants, and support overall health.',
    },
    {
      question: 'How do I transition my dog to a raw feeding diet?',
      answer: 'Transitioning your dog to a raw feeding diet should be done gradually to avoid digestive upset. Start by introducing small amounts of raw food mixed with your dog’s current diet, slowly increasing the raw portion over a week or more.',
    },
    {
      question: 'What are the benefits of raw feeding?',
      answer: 'Raw feeding can offer several benefits for dogs, including improved coat condition, healthier skin, better dental health, increased energy levels, and smaller, firmer stools. ',
    },
    {
      question: 'Can I feed ground raw food instead of whole cuts?',
      answer: 'While ground raw food is an option, it may lack the dental benefits of whole cuts. Be mindful that grinding can also reduce taurine levels.',
    },
    {
      question: 'Is it safe to feed live prey to my dog?',
      answer: 'No, feeding live prey is not recommended due to ethical concerns and potential harm to both the prey and your dog.',
    },
    {
      question: 'What are common sources of raw edible bones for my dog?',
      answer: 'Common sources include chicken wings, quail bones, and rabbit bones. Ensure the bones are soft and small enough for your dog to consume safely.',
    },
    {
      question: 'How do I know if my dog’s raw diet is nutritionally complete?',
      answer: 'Follow the 80:10:10 ratio for meat, raw edible bones, and organs. Providing a variety of proteins helps ensure a complete nutrient profile and 70:10:10:10 to add plants to your dog’s diet.',
    },
    {
      question: 'What should I do if my dog refuses to eat raw food?',
      answer: 'If your dog is hesitant, try introducing raw food gradually, mixing it with their current diet, or lightly searing the meat to enhance its aroma.',
    },
    {
        question: 'Are there any recipes for dogs?',
        answer: ''
      },
      {
        question: 'How much should I feed my dogs?',
        answer: 'Puppies should be fed as much as they would eat (as they are still growing), ideally on a 75:15:10 ratio for meat only and 65:15:10:10 ratio when plants are added to their diet and adult dogs should be fed 2-3% of their ideal body weight on a normal 80:10:10 ratio for meat only and 70:10:10:10 when adding plants.'
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
