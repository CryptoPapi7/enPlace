import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = '@enplace_avatar_uri';

export interface AvatarData {
  uri: string;
  updatedAt: number;
}

export async function getAvatar(): Promise<AvatarData | null> {
  try {
    const json = await AsyncStorage.getItem(AVATAR_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return null;
  } catch (e) {
    console.error('Failed to load avatar', e);
    return null;
  }
}

export async function saveAvatar(uri: string): Promise<void> {
  try {
    const data: AvatarData = {
      uri,
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(AVATAR_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save avatar', e);
    throw e;
  }
}

export async function clearAvatar(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AVATAR_KEY);
  } catch (e) {
    console.error('Failed to clear avatar', e);
    throw e;
  }
}
