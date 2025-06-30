import { supabase } from '@/constants/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export type AuditLogType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'VAULT_UNLOCKED'
  | 'VAULT_SETUP'
  | 'PASSWORD_CREATED'
  | 'PASSWORD_UPDATED'
  | 'PASSWORD_DELETED'
  | 'PASSWORD_REVEALED'
  | 'PASSWORD_COPIED';

interface LogDetails {
  credential_id?: string;
  details?: string;
  log_type?: string;
  device_id?: string;
  location_lat?: string;
  location_lon?: string;
}

const DEVICE_ID_KEY = 'device_unique_id';

function isValidUUID(str: string | null): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function getDeviceId(user: User): Promise<string> {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!isValidUUID(deviceId)) {
    deviceId = Crypto.randomUUID();
    
    const { error } = await supabase.from('device_id').insert({
        device_id: deviceId,
        name: `${Device.osName} ${Device.modelName || 'Unknown Device'}`,
        user_id: user.id,
        active: true,
    });

    if (error) {
        console.error("Fatal: Failed to register new device.", error.message);
        throw new Error("Could not register device.");
    }
    
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId!;
}

async function getLocation(): Promise<Location.LocationObject | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return null;
    }
    try {
        return await Location.getCurrentPositionAsync({});
    } catch (error) {
        console.warn('Could not fetch location:', error);
        return null;
    }
}

export async function logAuditEvent(
  log_type: AuditLogType,
  user: User | null,
  logDetails: Partial<LogDetails> = {}
) {
  if (!user) {
    console.warn('Audit log skipped: User is not authenticated.');
    return;
  }

  try {
    const device_id = await getDeviceId(user);
    const location = await getLocation();

    const bodyPayload: LogDetails = {
      ...logDetails,
      log_type: log_type, 
      device_id: device_id,
      location_lat: location?.coords.latitude.toString(),
      location_lon: location?.coords.longitude.toString(),
    };

    const { error } = await supabase.functions.invoke('log-audit-event', {
      body: bodyPayload,
    });

    if (error) {
      console.error('Error logging audit event via function:', error.message);
    }

  } catch (error: any) {
    console.error('Failed to prepare and invoke audit log function:', error.message);
  }
}