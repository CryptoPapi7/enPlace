import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlannedMeal {
  recipeId: string;
  recipeName: string;
  emoji: string;
  serveTime: string;
}

interface DayPlan {
  date: string;
  dayName: string;
  meals: PlannedMeal[];
}

const STORAGE_KEY = 'weeklyPlan';

export const saveWeeklyPlan = async (plan: DayPlan[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
};

export const getWeeklyPlan = async (): Promise<DayPlan[] | null> => {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const clearWeeklyPlan = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

export type { PlannedMeal, DayPlan };
