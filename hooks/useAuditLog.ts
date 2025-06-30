import { supabase } from "@/constants/supabase";
import { logEntry } from "@/types/auditLogs";
import { devicesEntry } from "@/types/userDevices";
import { User } from "@supabase/supabase-js";
import { useUserDevices, fetchUserDevices } from "@/hooks/useUserDevices"
import {
  useState,
} from "react";
import { Alert } from "react-native";

const VAULT_TABLE_NAME = "audit_log";

interface UseAuditLogProps {
  currentUser: User;
}

interface AuditLog {
  logs: logEntry[];
  handleSubmit: (
    formData: logEntry
  ) => Promise<boolean>;
}

export function useAuditLogs({
  currentUser,
}: UseAuditLogProps): AuditLog {
  const [logs, setLogs] = useState<logEntry[]>([]);

  const {
    devices: localDevices,
    handleSubmit: deviceSubmit
  } = useUserDevices({
    currentUser
  });

  const handleSubmit = async (
    formData: logEntry
  ): Promise<boolean> => {
    const device_example = {
     name: "Batata", 
     active: true 
    }

    const deviceCreation = await deviceSubmit(device_example);
    const devices = await fetchUserDevices();
    try {
      const { error } = await supabase.from(VAULT_TABLE_NAME).insert([
          {
            user_id: currentUser,
            credential_id: formData.credentialId,
            device_id: deviceCreation.device_id,
            log_date: formData.logDate,
            log_type: formData.logType,
            ip_address: formData.ipAddress,
            details: formData.details,
            location_lat: formData.locationLat,
            location_lon: formData.locationLon,
            validation: formData.validation,
          },
        ]);
      if (error) throw error;
      setLogs([...logs, formData]);

      return true;
    } catch (error: any) {
      Alert.alert("Log Error", error.message);
      return false;
    }
  };

  return {
    logs,
    handleSubmit,
  };
}