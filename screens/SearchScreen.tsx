import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredients, setIngredients] = useState([
    { id: '1', name: 'Almonds, unsalted', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '2', name: 'Alfalfa sprouts', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '3', name: 'Apples', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '4', name: 'Apricots, pitted', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '5', name: 'Asparagus', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '6', name: 'Bananas', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '7', name: 'Beef Heart', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '8', name: 'Beef Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '9', name: 'Beef Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '10', name: 'Beef Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '11', name: 'Beef Ribs', meat: 48, bone: 52, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '12', name: 'Beef Steak', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '13', name: 'Beef Trachea', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '14', name: 'Bell peppers', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '15', name: 'Beets', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '16', name: 'Blackberries', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '17', name: 'Blueberries', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '18', name: 'Bone 100%', meat: 0, bone: 100, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '19', name: 'Bone Meal', meat: 0, bone: 416.667, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '20', name: 'Broccoli', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '21', name: 'Brussels sprouts', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '22', name: 'Butternut squash', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '23', name: 'Cabbage', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '24', name: 'Cantaloupe', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '25', name: 'Carrots', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '26', name: 'Cashews, unsalted', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '27', name: 'Cauliflower', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '28', name: 'Celery', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '29', name: 'Chestnuts', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '30', name: 'Cherries, pitted', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '31', name: 'Chia Seeds', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '32', name: 'Chicken Back', meat: 50, bone: 50, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '33', name: 'Chicken Breast boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '34', name: 'Chicken Breast portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '35', name: 'Chicken Drumstick', meat: 66, bone: 33, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '36', name: 'Chicken Feet', meat: 40, bone: 60, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '37', name: 'Chicken Frame', meat: 56, bone: 44, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '38', name: 'Chicken Gizzard', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '39', name: 'Chicken Heart', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '40', name: 'Chicken Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '41', name: 'Chicken Leg quarter', meat: 73, bone: 27, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '42', name: 'Chicken Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '43', name: 'Chicken Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '44', name: 'Chicken Neck skinless', meat: 25, bone: 75, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '45', name: 'Chicken Neck with skin', meat: 64, bone: 36, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '46', name: 'Chicken Stripped 100% bone', meat: 0, bone: 100, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '47', name: 'Chicken Thigh Boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '48', name: 'Chicken Thigh portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '49', name: 'Chicken Wing', meat: 60, bone: 40, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '50', name: 'Chickpeas', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '51', name: 'Clams', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '52', name: 'Coconut', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '53', name: 'Corn, cooked', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '54', name: 'Cranberries', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '55', name: 'Cucumbers', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '56', name: 'Duck Back', meat: 50, bone: 50, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '57', name: 'Duck Breast portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '58', name: 'Duck Drumstick', meat: 66, bone: 33, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '59', name: 'Duck Feet', meat: 40, bone: 60, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '60', name: 'Duck Frame', meat: 56, bone: 44, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '61', name: 'Duck Gizzard', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '62', name: 'Duck Heart', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '63', name: 'Duck Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '64', name: 'Duck Leg quarter', meat: 73, bone: 27, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '65', name: 'Duck Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '66', name: 'Duck Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '67', name: 'Duck Neck skinless', meat: 25, bone: 75, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '68', name: 'Duck Neck with skin', meat: 64, bone: 36, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '69', name: 'Duck Ribs', meat: 48, bone: 52, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '70', name: 'Duck Stripped 100% bone', meat: 0, bone: 100, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '71', name: 'Duck Thigh Boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '72', name: 'Duck Thigh portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '73', name: 'Duck Wing', meat: 60, bone: 40, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '74', name: 'Eggplant', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '75', name: 'Fish Body', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '76', name: 'Fish Fillet', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '77', name: 'Fish Head', meat: 66, bone: 34, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '78', name: 'Fish Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '79', name: 'Fish Ribs', meat: 50, bone: 50, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '80', name: 'FlaxSeeds', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '81', name: 'Green beans', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '82', name: 'Green peas', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '83', name: 'Guava', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '84', name: 'Hazelnuts', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '85', name: 'Hemp Seeds', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '86', name: 'Honeydew', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '87', name: 'Kale', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '88', name: 'Kiwifruit', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '89', name: 'Lamb Back', meat: 50, bone: 50, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '90', name: 'Lamb Breast portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '91', name: 'Lamb Drumstick', meat: 66, bone: 33, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '92', name: 'Lamb Feet', meat: 40, bone: 60, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '93', name: 'Lamb Frame', meat: 56, bone: 44, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '94', name: 'Lamb Gizzard', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '95', name: 'Lamb Heart', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '96', name: 'Lamb Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '97', name: 'Lamb Leg quarter', meat: 73, bone: 27, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '98', name: 'Lamb Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '99', name: 'Lamb Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '100', name: 'Lamb Neck skinless', meat: 25, bone: 75, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '101', name: 'Lamb Neck with skin', meat: 64, bone: 36, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '102', name: 'Lamb Ribs', meat: 48, bone: 52, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '103', name: 'Lamb Stripped 100% bone', meat: 0, bone: 100, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '104', name: 'Lamb Thigh Boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '105', name: 'Lamb Thigh portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '106', name: 'Lamb Wing', meat: 60, bone: 40, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '107', name: 'Lentils', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '108', name: 'Lettuce', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '109', name: 'Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '110', name: 'Lobster', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '111', name: 'Lobster Tail', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '112', name: 'Mussels', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '113', name: 'Mushroom, store-bought', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '114', name: 'Orange', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '115', name: 'Oysters', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '116', name: 'Parsnips', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '117', name: 'Peanuts', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '118', name: 'Peas', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '119', name: 'Pineapple', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '120', name: 'Pistachio, unsalted', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '121', name: 'Pork Back', meat: 50, bone: 50, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '122', name: 'Pork Breast portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '123', name: 'Pork Drumstick', meat: 66, bone: 33, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '124', name: 'Pork Feet', meat: 40, bone: 60, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '125', name: 'Pork Frame', meat: 56, bone: 44, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '126', name: 'Pork Gizzard', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '127', name: 'Pork Heart', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '128', name: 'Pork Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '129', name: 'Pork Leg quarter', meat: 73, bone: 27, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '130', name: 'Pork Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '131', name: 'Pork Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '132', name: 'Pork Neck skinless', meat: 25, bone: 75, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '133', name: 'Pork Neck with skin', meat: 64, bone: 36, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '134', name: 'Pork Ribs', meat: 48, bone: 52, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '135', name: 'Pork Stripped 100% bone', meat: 0, bone: 100, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '136', name: 'Pork Thigh Boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '137', name: 'Pork Thigh portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '138', name: 'Pork Wing', meat: 60, bone: 40, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '139', name: 'Pumpkin', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 },
    { id: '140', name: 'Pumpkin Seeds, unsalted', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '141', name: 'Quinoa Seeds, cooked', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '142', name: 'Rabbit Back', meat: 50, bone: 50, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '143', name: 'Rabbit Breast portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '144', name: 'Rabbit Drumstick', meat: 66, bone: 33, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '145', name: 'Rabbit Feet', meat: 40, bone: 60, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '146', name: 'Rabbit Frame', meat: 56, bone: 44, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '147', name: 'Rabbit Gizzard', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '148', name: 'Rabbit Heart', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '149', name: 'Rabbit Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '150', name: 'Rabbit Leg quarter', meat: 73, bone: 27, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '151', name: 'Rabbit Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '152', name: 'Rabbit Mince, boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '153', name: 'Rabbit Neck skinless', meat: 25, bone: 75, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '154', name: 'Rabbit Neck with skin', meat: 64, bone: 36, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '155', name: 'Rabbit Ribs', meat: 48, bone: 52, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '156', name: 'Rabbit Stripped 100% bone', meat: 0, bone: 100, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '157', name: 'Rabbit Thigh Boneless', meat: 100, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '158', name: 'Rabbit Thigh portion', meat: 80, bone: 20, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '159', name: 'Rabbit Wing', meat: 60, bone: 40, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '160', name: 'Sesame Seeds', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '161', name: 'Sunflower Seeds', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100 },
    { id: '162', name: 'Turkey Back', meat: 59, bone: 41, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '163', name: 'Turkey Breast', meat: 90, bone: 10, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '164', name: 'Turkey Drumstick', meat: 79, bone: 21, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '165', name: 'Turkey Kidney', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '166', name: 'Turkey Leg', meat: 83, bone: 17, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '167', name: 'Turkey Liver', meat: 0, bone: 0, organ: 100, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '168', name: 'Turkey Neck', meat: 60, bone: 40, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '169', name: 'Turkey Tail', meat: 76, bone: 24, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '170', name: 'Turkey Thigh', meat: 81, bone: 19, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '171', name: 'Turkey Wing', meat: 66, bone: 34, organ: 0, vegetable: 0, fruit: 0, nuts: 0 },
    { id: '172', name: 'Strawberry', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '173', name: 'Watermelon, seedless', meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0 },
    { id: '174', name: 'Zucchini', meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0 }
    
  ]);

  const navigation = useNavigation();
  

  const handlePressIngredient = (ingredient) => {
    const { meat, bone, organ, vegetable, fruit, nuts } = ingredient;
  
    let type = '';
  
    if (meat > 0 || bone > 0 || organ > 0) {
      type = 'Meat'; // If it’s a meat ingredient, set type to 'Meat'
    } else if (vegetable > 0) {
      type = 'Vegetable';
    } else if (fruit > 0) {
      type = 'Fruit';
    } else if (nuts > 0) {
      type = 'Nut & Seed';
    }

    navigation.navigate('FoodInfoScreen', { ingredient: { ...ingredient, type } });
  };

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust the offset for iOS
  >
    <FlatList
      data={filteredIngredients}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePressIngredient(item)}>
          <View style={styles.ingredientItem}>
            <Text style={styles.ingredientText}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => <Text style={styles.emptyText}>No ingredients found</Text>}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
    />

    <View style={[styles.searchBarContainer, Platform.OS === 'android' && { marginBottom: 10 }]}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search ingredients..."
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />
      <TouchableOpacity style={styles.searchIcon}>
        <FontAwesome name="search" size={24} color="black" />
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContent: {
    paddingBottom: 100, // Ensures enough padding at the bottom to accommodate the keyboard
  },
  ingredientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  ingredientText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  searchBarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  searchIcon: {
    marginLeft: 10,
  },
});

export default SearchScreen;