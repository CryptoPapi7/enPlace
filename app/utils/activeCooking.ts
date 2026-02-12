import AsyncStorage from '@react-native-async-storage/async-storage';

// Active cooking state management
// Tracks what recipe the user is currently cooking and which step they're on

interface ActiveCooking {
  recipeId: string;
  recipeName: string;
  currentStep: number;
  totalSteps: number;
  startedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'activeCooking';

export const setActiveCooking = async (data: ActiveCooking): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getActiveCooking = async (): Promise<ActiveCooking | null> => {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const clearActiveCooking = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export const updateCurrentStep = async (step: number): Promise<void> => {
  const saved = await getActiveCooking();
  if (saved) {
    saved.currentStep = step;
    await setActiveCooking(saved);
  }
};

export type { ActiveCooking };
