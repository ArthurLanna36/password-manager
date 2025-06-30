import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '@/constants/supabase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText/ThemedText';
import { List, Button, IconButton, useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { RefreshControl } from 'react-native-gesture-handler';
import { User } from '@supabase/supabase-js';
import { AlertDetailsModal } from '@/components/AlertDetailsModal/AlertDetailsModal';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const theme = useTheme();

  
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  
  const handleAlertPress = (alert: any) => {
    setSelectedAlert(alert);
    setIsModalVisible(true);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        if (user) {
            fetchAlerts();
        }
    });
  }, []);

  
  useEffect(() => {
    if (!user) return;

    
    const handleNewAlert = (payload: any) => {
        console.log('Novo alerta recebido em tempo real:', payload.new);
        setAlerts(currentAlerts => [payload.new, ...currentAlerts]);
    };

    
    const subscription = supabase
      .channel('security_alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_alerts', filter: `user_id=eq.${user.id}` },
        handleNewAlert
      )
      .subscribe();

    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const fetchAlerts = async () => {
    if (!refreshing) setLoading(true);

    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert("Erro", "Não foi possível buscar os alertas.");
    } else {
      setAlerts(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts();
  }, []);

  
  const handleDeleteAlert = async (alertId: string) => {
    const { error } = await supabase
        .from('security_alerts')
        .delete()
        .eq('id', alertId);

    if(error) {
        Alert.alert("Erro", "Não foi possível deletar o alerta.");
    } else {
        
        setAlerts(currentAlerts => currentAlerts.filter(a => a.id !== alertId));
    }
  };

  
  const handleDeleteAllAlerts = async () => {
    if (!user) return;

    Alert.alert(
        "Limpar Alertas",
        "Você tem certeza que deseja apagar todos os alertas?",
        [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Apagar Tudo",
                style: "destructive",
                onPress: async () => {
                    setLoading(true); 
                    const { error } = await supabase
                        .from('security_alerts')
                        .delete()
                        .eq('user_id', user.id);
                    setLoading(false);

                    if (error) {
                        Alert.alert("Erro", "Não foi possível apagar os alertas.");
                    } else {
                        setAlerts([]); 
                    }
                }
            }
        ]
    );
  };

  if (loading) {
    return <ThemedView style={styles.center}><ActivityIndicator animating={true} /></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      {alerts.length > 0 && (
         <Button 
            icon="delete-sweep" 
            mode="contained-tonal"
            onPress={handleDeleteAllAlerts}
            style={styles.button}
        >
            Limpar Histórico
        </Button>
      )}

      {alerts.length === 0 ? (
         <ThemedView style={styles.center}>
            <ThemedText>Nenhum alerta de segurança.</ThemedText>
            <Button onPress={onRefresh} style={{marginTop: 10}}>Recarregar</Button>
         </ThemedView>
      ) : (
        <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
            renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleAlertPress(item)}>
                <List.Item
                    title="Atividade Incomum Detectada"
                    description={item.reason}
                    left={props => <List.Icon {...props} color={theme.colors.error} icon="shield-alert-outline" />}
                    right={() => (
                        <View style={styles.itemActions}>
                            <Text style={{alignSelf: 'center', marginRight: 8}}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            <IconButton
                                icon="delete"
                                iconColor={theme.colors.error}
                                size={20}
                                onPress={() => handleDeleteAlert(item.id)}
                            />
                        </View>
                    )}
                />
            </TouchableOpacity>
            )}
        />
      )}
      <AlertDetailsModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        alert={selectedAlert}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    button: { margin: 16 },
    itemActions: { flexDirection: 'row', alignItems: 'center' }
});
