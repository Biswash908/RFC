"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [currentInfoText, setCurrentInfoText] = useState("")
  const [ingredients, setIngredients] = useState([
    // All ingredients combined and sorted alphabetically with sequential IDs
    {
      id: "1",
      name: "Alfalfa sprouts",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 100,
      fruit: 0,
      nuts: 0,
      type: "Vegetable",
    },
    { id: "2", name: "Apples", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "3", name: "Apricots, pitted", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "4", name: "Asparagus", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "5", name: "Bananas", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "6", name: "Beef Heart", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "7", name: "Beef Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "8", name: "Beef Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "9", name: "Beef Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "10", name: "Beef Ribs", meat: 48, bone: 52, organ: 0, type: "Meat" },
    { id: "11", name: "Beef Steak", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "12", name: "Beef Trachea", meat: 100, bone: 0, organ: 0, type: "Meat" },
    {
      id: "13",
      name: "Bell peppers",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 100,
      fruit: 0,
      nuts: 0,
      type: "Vegetable",
    },
    { id: "14", name: "Beets", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "15", name: "Blackberries", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "16", name: "Blueberries", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "17", name: "Bone 100%", meat: 0, bone: 100, organ: 0, type: "Meat" },
    {
      id: "18",
      name: "Bone Meal",
      meat: 0,
      bone: 416.667,
      organ: 0,
      type: "Supplement",
      isSupplementInfo: true,
      supplementInfo:
        "Bone Meal is shown as 416.667% bone because it's a concentrated calcium and phosphorus supplement. This percentage reflects its equivalent calcium content compared to raw bone, not its actual weight.",
    },
    { id: "19", name: "Broccoli", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    {
      id: "20",
      name: "Brussels sprouts",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 100,
      fruit: 0,
      nuts: 0,
      type: "Vegetable",
    },
    {
      id: "21",
      name: "Butternut squash",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 100,
      fruit: 0,
      nuts: 0,
      type: "Vegetable",
    },
    { id: "22", name: "Cabbage", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "23", name: "Cantaloupe", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "24", name: "Carrots", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    {
      id: "25",
      name: "Cashews, unsalted",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 0,
      nuts: 100,
      type: "Nut & Seed",
    },
    { id: "26", name: "Cauliflower", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "27", name: "Celery", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "28", name: "Chestnuts", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    {
      id: "29",
      name: "Cherries, pitted",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 100,
      nuts: 0,
      type: "Fruit",
    },
    { id: "30", name: "Chia Seeds", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    { id: "31", name: "Chicken Back", meat: 50, bone: 50, organ: 0, type: "Meat" },
    { id: "32", name: "Chicken Breast boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "33", name: "Chicken Breast portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "34", name: "Chicken Drumstick", meat: 66, bone: 33, organ: 0, type: "Meat" },
    { id: "35", name: "Chicken Feet", meat: 40, bone: 60, organ: 0, type: "Meat" },
    { id: "36", name: "Chicken Frame", meat: 56, bone: 44, organ: 0, type: "Meat" },
    { id: "37", name: "Chicken Gizzard", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "38", name: "Chicken Heart", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "39", name: "Chicken Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "40", name: "Chicken Leg quarter", meat: 73, bone: 27, organ: 0, type: "Meat" },
    { id: "41", name: "Chicken Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "42", name: "Chicken Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "43", name: "Chicken Neck skinless", meat: 25, bone: 75, organ: 0, type: "Meat" },
    { id: "44", name: "Chicken Neck with skin", meat: 64, bone: 36, organ: 0, type: "Meat" },
    { id: "45", name: "Chicken Stripped 100% bone", meat: 0, bone: 100, organ: 0, type: "Meat" },
    { id: "46", name: "Chicken Thigh Bone In", meat: 79, bone: 21, organ: 0, type: "Meat" },
    { id: "47", name: "Chicken Thigh Boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "48", name: "Chicken Thigh portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "49", name: "Chicken Whole DeBone Leg and Wings", meat: 78, bone: 22, organ: 0, type: "Meat" },
    { id: "50", name: "Chicken Whole oven ready", meat: 70, bone: 30, organ: 0, type: "Meat" },
    { id: "51", name: "Chicken Wing", meat: 60, bone: 40, organ: 0, type: "Meat" },
    { id: "52", name: "Chickpeas", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "53", name: "Clams", meat: 100, bone: 0, organ: 0, type: "Seafood" },
    { id: "54", name: "Coconut", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    {
      id: "55",
      name: "Corn, cooked",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 100,
      fruit: 0,
      nuts: 0,
      type: "Vegetable",
    },
    { id: "56", name: "Cornish Game Hen Whole", meat: 61, bone: 39, organ: 0, type: "Meat" },
    { id: "57", name: "Cranberries", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "58", name: "Cucumbers", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "59", name: "Duck Back", meat: 50, bone: 50, organ: 0, type: "Meat" },
    { id: "60", name: "Duck Breast portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "61", name: "Duck Drumstick", meat: 66, bone: 33, organ: 0, type: "Meat" },
    { id: "62", name: "Duck Feet", meat: 40, bone: 60, organ: 0, type: "Meat" },
    { id: "63", name: "Duck Frame", meat: 56, bone: 44, organ: 0, type: "Meat" },
    { id: "64", name: "Duck Gizzard", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "65", name: "Duck Head", meat: 25, bone: 75, organ: 0, type: "Meat" },
    { id: "66", name: "Duck Heart", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "67", name: "Duck Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "68", name: "Duck Leg quarter", meat: 73, bone: 27, organ: 0, type: "Meat" },
    { id: "69", name: "Duck Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "70", name: "Duck Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "71", name: "Duck Neck skinless", meat: 25, bone: 75, organ: 0, type: "Meat" },
    { id: "72", name: "Duck Neck with skin", meat: 64, bone: 36, organ: 0, type: "Meat" },
    { id: "73", name: "Duck Ribs", meat: 48, bone: 52, organ: 0, type: "Meat" },
    { id: "74", name: "Duck Stripped 100% bone", meat: 0, bone: 100, organ: 0, type: "Meat" },
    { id: "75", name: "Duck Thigh Boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "76", name: "Duck Thigh portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "77", name: "Duck Whole Domestic Oven ready Duck", meat: 72, bone: 28, organ: 0, type: "Meat" },
    { id: "78", name: "Duck wild, Breast portion", meat: 85, bone: 15, organ: 0, type: "Meat" },
    { id: "79", name: "Duck Wing", meat: 60, bone: 40, organ: 0, type: "Meat" },
    { id: "80", name: "Eggplant", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "81", name: "Fish Body", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "82", name: "Fish Fillet", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "83", name: "Fish Head", meat: 66, bone: 34, organ: 0, type: "Meat" },
    { id: "84", name: "Fish Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "85", name: "Fish Ribs", meat: 50, bone: 50, organ: 0, type: "Meat" },
    { id: "86", name: "Fish Whole", meat: 80, bone: 10, organ: 10, type: "Meat" },
    { id: "87", name: "FlaxSeeds", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    { id: "88", name: "Green beans", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "89", name: "Green peas", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "90", name: "Guava", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "91", name: "Hazelnuts", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    { id: "92", name: "Hemp Seeds", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    { id: "93", name: "Honeydew", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "94", name: "Kale", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "95", name: "Kiwifruit", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "96", name: "Lamb Arm", meat: 91, bone: 9, organ: 0, type: "Meat" },
    { id: "97", name: "Lamb Back", meat: 50, bone: 50, organ: 0, type: "Meat" },
    { id: "98", name: "Lamb Blade", meat: 72, bone: 28, organ: 0, type: "Meat" },
    { id: "99", name: "Lamb Breast portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "100", name: "Lamb Centre Slice Leg", meat: 94, bone: 6, organ: 0, type: "Meat" },
    { id: "101", name: "Lamb Drumstick", meat: 66, bone: 33, organ: 0, type: "Meat" },
    { id: "102", name: "Lamb Feet", meat: 40, bone: 60, organ: 0, type: "Meat" },
    { id: "103", name: "Lamb Frame", meat: 56, bone: 44, organ: 0, type: "Meat" },
    { id: "104", name: "Lamb Gizzard", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "105", name: "Lamb Half Shank", meat: 83, bone: 17, organ: 0, type: "Meat" },
    { id: "106", name: "Lamb Heart", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "107", name: "Lamb Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "108", name: "Lamb Leg quarter", meat: 73, bone: 27, organ: 0, type: "Meat" },
    { id: "109", name: "Lamb Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "110", name: "Lamb Loin", meat: 72, bone: 28, organ: 0, type: "Meat" },
    { id: "111", name: "Lamb Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "112", name: "Lamb Neck skinless", meat: 25, bone: 75, organ: 0, type: "Meat" },
    { id: "113", name: "Lamb Neck with skin", meat: 64, bone: 36, organ: 0, type: "Meat" },
    { id: "114", name: "Lamb Ribs", meat: 48, bone: 52, organ: 0, type: "Meat" },
    { id: "115", name: "Lamb Stripped 100% bone", meat: 0, bone: 100, organ: 0, type: "Meat" },
    { id: "116", name: "Lamb Thigh Boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "117", name: "Lamb Thigh portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "118", name: "Lamb Whole Shank", meat: 86, bone: 14, organ: 0, type: "Meat" },
    { id: "119", name: "Lamb Wing", meat: 60, bone: 40, organ: 0, type: "Meat" },
    { id: "120", name: "Lentils", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "121", name: "Lettuce", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "122", name: "Lobster", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "123", name: "Lobster Tail", meat: 100, bone: 0, organ: 0, type: "Meat" },
    {
      id: "124",
      name: "Mushroom, store-bought",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 100,
      fruit: 0,
      nuts: 0,
      type: "Vegetable",
    },
    { id: "125", name: "Mussels", meat: 100, bone: 0, organ: 0, type: "Seafood" },
    { id: "126", name: "Orange", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    { id: "127", name: "Oysters", meat: 100, bone: 0, organ: 0, type: "Seafood" },
    { id: "128", name: "Parsnips", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "129", name: "Peanuts", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 0, nuts: 100, type: "Nut & Seed" },
    { id: "130", name: "Peas", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    { id: "131", name: "Pineapple", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    {
      id: "132",
      name: "Pistachio, unsalted",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 0,
      nuts: 100,
      type: "Nut & Seed",
    },
    { id: "133", name: "Pork Back", meat: 50, bone: 50, organ: 0, type: "Meat" },
    { id: "134", name: "Pork Breast portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "135", name: "Pork Drumstick", meat: 66, bone: 33, organ: 0, type: "Meat" },
    { id: "136", name: "Pork Feet", meat: 40, bone: 60, organ: 0, type: "Meat" },
    { id: "137", name: "Pork Frame", meat: 56, bone: 44, organ: 0, type: "Meat" },
    { id: "138", name: "Pork Gizzard", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "139", name: "Pork Heart", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "140", name: "Pork Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "141", name: "Pork Leg quarter", meat: 73, bone: 27, organ: 0, type: "Meat" },
    { id: "142", name: "Pork Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "143", name: "Pork Loin steak", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "144", name: "Pork Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "145", name: "Pork Neck skinless", meat: 25, bone: 75, organ: 0, type: "Meat" },
    { id: "146", name: "Pork Neck with skin", meat: 64, bone: 36, organ: 0, type: "Meat" },
    { id: "147", name: "Pork Ribs", meat: 48, bone: 52, organ: 0, type: "Meat" },
    { id: "148", name: "Pork Stripped 100% bone", meat: 0, bone: 100, organ: 0, type: "Meat" },
    { id: "149", name: "Pork Tails", meat: 70, bone: 30, organ: 0, type: "Meat" },
    { id: "150", name: "Pork Thigh Boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "151", name: "Pork Thigh portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "152", name: "Pork Wing", meat: 60, bone: 40, organ: 0, type: "Meat" },
    {
      id: "153",
      name: "Powdered Eggshell",
      meat: 0,
      bone: 2500,
      organ: 0,
      type: "Supplement",
      isSupplementInfo: true,
      supplementInfo:
        "Powdered Eggshell is listed as 2500% bone due to its extremely high calcium concentration. Just 1g can replace about 25g of raw bone, making it a potent bone substitute in boneless diets.",
    },
    { id: "154", name: "Pumpkin", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
    {
      id: "155",
      name: "Pumpkin Seeds, unsalted",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 0,
      nuts: 100,
      type: "Nut & Seed",
    },
    { id: "156", name: "Quail Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "157", name: "Quail Whole Oven Ready", meat: 73, bone: 27, organ: 0, type: "Meat" },
    {
      id: "158",
      name: "Quinoa Seeds, cooked",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 0,
      nuts: 100,
      type: "Nut & Seed",
    },
    { id: "159", name: "Rabbit Back", meat: 50, bone: 50, organ: 0, type: "Meat" },
    { id: "160", name: "Rabbit Breast portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "161", name: "Rabbit Drumstick", meat: 66, bone: 33, organ: 0, type: "Meat" },
    { id: "162", name: "Rabbit Feet", meat: 40, bone: 60, organ: 0, type: "Meat" },
    { id: "163", name: "Rabbit Frame", meat: 56, bone: 44, organ: 0, type: "Meat" },
    { id: "164", name: "Rabbit Gizzard", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "165", name: "Rabbit Heart", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "166", name: "Rabbit Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "167", name: "Rabbit Leg quarter", meat: 73, bone: 27, organ: 0, type: "Meat" },
    { id: "168", name: "Rabbit Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "169", name: "Rabbit Mince, boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "170", name: "Rabbit Neck skinless", meat: 25, bone: 75, organ: 0, type: "Meat" },
    { id: "171", name: "Rabbit Neck with skin", meat: 64, bone: 36, organ: 0, type: "Meat" },
    { id: "172", name: "Rabbit Ribs", meat: 48, bone: 52, organ: 0, type: "Meat" },
    { id: "173", name: "Rabbit Stripped 100% bone", meat: 0, bone: 100, organ: 0, type: "Meat" },
    { id: "174", name: "Rabbit Thigh Boneless", meat: 100, bone: 0, organ: 0, type: "Meat" },
    { id: "175", name: "Rabbit Thigh portion", meat: 80, bone: 20, organ: 0, type: "Meat" },
    { id: "176", name: "Rabbit Whole Rabbit (Dressed)", meat: 70, bone: 30, organ: 0, type: "Meat" },
    {
      id: "177",
      name: "Sesame Seeds",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 0,
      nuts: 100,
      type: "Nut & Seed",
    },
    { id: "178", name: "Strawberry", meat: 0, bone: 0, organ: 0, vegetable: 0, fruit: 100, nuts: 0, type: "Fruit" },
    {
      id: "179",
      name: "Sunflower Seeds",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 0,
      nuts: 100,
      type: "Nut & Seed",
    },
    { id: "180", name: "Turkey Back", meat: 59, bone: 41, organ: 0, type: "Meat" },
    { id: "181", name: "Turkey Breast", meat: 90, bone: 10, organ: 0, type: "Meat" },
    { id: "182", name: "Turkey Drumstick", meat: 79, bone: 21, organ: 0, type: "Meat" },
    { id: "183", name: "Turkey Kidney", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "184", name: "Turkey Leg", meat: 83, bone: 17, organ: 0, type: "Meat" },
    { id: "185", name: "Turkey Liver", meat: 0, bone: 0, organ: 100, type: "Meat" },
    { id: "186", name: "Turkey Neck", meat: 60, bone: 40, organ: 0, type: "Meat" },
    { id: "187", name: "Turkey Tail", meat: 76, bone: 24, organ: 0, type: "Meat" },
    { id: "188", name: "Turkey Thigh", meat: 81, bone: 19, organ: 0, type: "Meat" },
    { id: "189", name: "Turkey Wing", meat: 66, bone: 34, organ: 0, type: "Meat" },
    {
      id: "190",
      name: "Watermelon, seedless",
      meat: 0,
      bone: 0,
      organ: 0,
      vegetable: 0,
      fruit: 100,
      nuts: 0,
      type: "Fruit",
    },
    { id: "191", name: "Zucchini", meat: 0, bone: 0, organ: 0, vegetable: 100, fruit: 0, nuts: 0, type: "Vegetable" },
  ])

  // Sort ingredients alphabetically by name
  useEffect(() => {
    const sortedIngredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name))
    setIngredients(sortedIngredients)
  }, [])

  const navigation = useNavigation()

  const handlePressIngredient = (ingredient) => {
    const { meat, bone, organ, vegetable, fruit, nuts, type } = ingredient

    // If type is already defined, use it
    if (type) {
      navigation.navigate("FoodInfoScreen", { ingredient })
      return
    }

    // Otherwise determine type based on composition
    let ingredientType = ""

    if (meat > 0 || bone > 0 || organ > 0) {
      ingredientType = "Meat" // If it's a meat ingredient, set type to 'Meat'
    } else if (vegetable > 0) {
      ingredientType = "Vegetable"
    } else if (fruit > 0) {
      ingredientType = "Fruit"
    } else if (nuts > 0) {
      ingredientType = "Nut & Seed"
    }

    navigation.navigate("FoodInfoScreen", { ingredient: { ...ingredient, type: ingredientType } })
  }

  const showInfoModal = (infoText) => {
    setCurrentInfoText(infoText)
    setInfoModalVisible(true)
  }

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust the offset for iOS
    >
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePressIngredient(item)}>
            <View
              style={[
                styles.ingredientItem,
                item.type === "Vegetable"
                  ? styles.vegetableItem
                  : item.type === "Fruit"
                    ? styles.fruitItem
                    : item.type === "Nut & Seed"
                      ? styles.nutItem
                      : item.type === "Supplement"
                        ? styles.supplementItem
                        : styles.meatItem,
              ]}
            >
              <View style={styles.ingredientRow}>
                <Text style={styles.ingredientText}>{item.name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No ingredients found</Text>}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.searchBarContainer, Platform.OS === "android" && { marginBottom: 10 }]}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search ingredients..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.searchIcon}>
          <FontAwesome name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  listContent: {
    paddingBottom: 100, // Ensures enough padding at the bottom to accommodate the keyboard
  },
  ingredientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vegetableItem: {
    backgroundColor: "white", // Light green for vegetables
  },
  fruitItem: {
    backgroundColor: "white", // Light yellow for fruits
  },
  nutItem: {
    backgroundColor: "white", // Light purple for nuts & seeds
  },
  meatItem: {
    backgroundColor: "white", // Light red for meat
  },
  supplementItem: {
    backgroundColor: "white", // Light blue for supplements
  },
  ingredientText: {
    fontSize: 16,
    flex: 1,
  },
  supplementText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 5,
    color: "#555",
  },
  infoButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#777",
  },
  searchBarContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "white",
  },
  searchBar: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  searchIcon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#000080",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default SearchScreen

