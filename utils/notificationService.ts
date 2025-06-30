import * as Notifications from 'expo-notifications';
import { supabase } from '@/constants/supabase';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync({ projectId: 'f4843519-5517-44c0-9321-643500376a89' })).data;
  console.log("Expo Push Token for debug:", token);

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function savePushToken(userId: string, token: string) {
    if (!userId || !token) return;
    const { error } = await supabase
        .from('user_profiles')
        .update({ push_token: token })
        .eq('id', userId);

    if (error) {
        console.error("Erro ao salvar push token:", error.message);
    }
}