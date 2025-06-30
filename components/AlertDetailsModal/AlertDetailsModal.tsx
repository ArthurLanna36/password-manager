import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Card, Text, ActivityIndicator, Divider, useTheme, IconButton } from 'react-native-paper';
import { supabase } from '@/constants/supabase';
import { Feather } from '@expo/vector-icons';


interface Alert {
  id: string;
  reason: string;
  created_at: string;
  log_id: string;
  
}

interface LogDetails {
  ip_address: string;
  location_lat?: string;
  location_lon?: string;
  
}

interface Props {
  visible: boolean;
  onClose: () => void;
  alert: Alert | null;
}

export function AlertDetailsModal({ visible, onClose, alert }: Props) {
  const [logDetails, setLogDetails] = useState<LogDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    
    if (alert && alert.log_id) {
      setLoading(true);
      const fetchLogDetails = async () => {
        const { data, error } = await supabase
          .from('audit_log')
          .select('ip_address, location_lat, location_lon')
          .eq('log_id', alert.log_id)
          .single();

        if (error) {
          console.error("Erro ao buscar detalhes do log:", error);
        } else {
          setLogDetails(data);
        }
        setLoading(false);
      };

      fetchLogDetails();
    } else {
      setLogDetails(null);
    }
  }, [alert]);

  if (!alert) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Card style={styles.modalCard}>
          <Card.Title
            title="Detalhes do Alerta"
            titleStyle={{ color: theme.colors.error }}
            right={(props) => <IconButton {...props} icon="close" onPress={onClose} />}
          />
          <Card.Content>
            <Text variant="titleMedium">{alert.reason}</Text>
            <Text variant="bodySmall" style={{ marginBottom: 16 }}>
              {new Date(alert.created_at).toLocaleString()}
            </Text>
            <Divider />
            {loading ? (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            ) : logDetails ? (
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Feather name="globe" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text style={styles.detailText}>IP: {logDetails.ip_address || 'Não registrado'}</Text>
                </View>
                {logDetails.location_lat && logDetails.location_lon && (
                    <View style={styles.detailItem}>
                        <Feather name="map-pin" size={16} color={theme.colors.onSurfaceVariant} />
                        <Text style={styles.detailText}>
                            Localização (Lat/Lon): {parseFloat(logDetails.location_lat).toFixed(4)}, {parseFloat(logDetails.location_lon).toFixed(4)}
                        </Text>
                    </View>
                )}
              </View>
            ) : (
                <Text style={{ marginVertical: 20 }}>Detalhes do log não encontrados.</Text>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={onClose}>Fechar</Button>
          </Card.Actions>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
  },
  detailsContainer: {
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
  },
});