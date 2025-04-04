"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

type UnitType = "g" | "kg" | "lbs"

type UnitContextType = {
  unit: UnitType
  setUnit: (unit: UnitType) => void
  toggleUnit: () => void
  convertWeight: (weight: number, fromUnit: UnitType, toUnit: UnitType) => number
  formatWeight: (weight: number, includeUnit?: boolean) => string
  isLoading: boolean
}

const UnitContext = createContext<UnitContextType | undefined>(undefined)

const UNIT_STORAGE_KEY = "app_weight_unit"

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnitState] = useState<UnitType>("g")
  const [isLoading, setIsLoading] = useState(true)

  // Load saved unit preference on startup
  useEffect(() => {
    const loadSavedUnit = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem(UNIT_STORAGE_KEY)
        if (savedUnit && (savedUnit === "g" || savedUnit === "kg" || savedUnit === "lbs")) {
          setUnitState(savedUnit as UnitType)
        }
      } catch (error) {
        console.error("Failed to load unit preference:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedUnit()
  }, [])

  // Save unit preference when it changes
  const setUnit = async (newUnit: UnitType) => {
    setUnitState(newUnit)
    try {
      await AsyncStorage.setItem(UNIT_STORAGE_KEY, newUnit)
    } catch (error) {
      console.error("Failed to save unit preference:", error)
    }
  }

  // Cycle through units: g -> kg -> lbs -> g
  const toggleUnit = () => {
    const nextUnit = unit === "g" ? "kg" : unit === "kg" ? "lbs" : "g"
    setUnit(nextUnit)
  }

  // Convert weight between units
  const convertWeight = (weight: number, fromUnit: UnitType, toUnit: UnitType): number => {
    if (fromUnit === toUnit) return weight

    // Convert to grams first (as base unit)
    let weightInGrams = weight
    if (fromUnit === "kg") {
      weightInGrams = weight * 1000
    } else if (fromUnit === "lbs") {
      weightInGrams = weight * 453.592
    }

    // Convert from grams to target unit
    if (toUnit === "g") {
      return weightInGrams
    } else if (toUnit === "kg") {
      return weightInGrams / 1000
    } else {
      // lbs
      return weightInGrams / 453.592
    }
  }

  // Format weight with appropriate precision
  const formatWeight = (weight: number, includeUnit = true): string => {
    if (isNaN(weight)) weight = 0

    let formattedNumber
    if (unit === "g") {
      // For grams, show whole numbers if possible
      formattedNumber = weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(2)
    } else {
      // For kg and lbs, always show 2 decimal places
      formattedNumber = weight.toFixed(2)
    }

    return includeUnit ? `${formattedNumber}${unit}` : formattedNumber
  }

  return (
    <UnitContext.Provider
      value={{
        unit,
        setUnit,
        toggleUnit,
        convertWeight,
        formatWeight,
        isLoading,
      }}
    >
      {children}
    </UnitContext.Provider>
  )
}

export const useUnit = () => {
  const context = useContext(UnitContext)
  if (!context) {
    throw new Error("useUnit must be used within a UnitProvider")
  }
  return context
}

