import React, { useState, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/constants/supabase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText/ThemedText';
import { List } from 'react-native-paper';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar alertas:", error.message);
    } else {
      setAlerts(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [])
  );

  if (loading) {
    return <ThemedView style={styles.center}><Text>Loading alerts...</Text></ThemedView>;
  }

  if (alerts.length === 0) {
    return <ThemedView style={styles.center}><ThemedText>Empty security alerts.</ThemedText></ThemedView>;
  }

  return (
    <FlatList
      data={alerts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <List.Item
          title="Unusual activity detected!"
          description={item.reason}
          left={props => <List.Icon {...props} icon="shield-alert-outline" />}
          right={() => <Text style={{alignSelf: 'center'}}>{new Date(item.created_at).toLocaleDateString()}</Text>}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});