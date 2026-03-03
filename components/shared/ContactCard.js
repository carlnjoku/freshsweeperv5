import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';

const ContactCard = ({ name, address, phone }) => {
  const theme = useTheme();

  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleMap = () => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title={name}
        titleStyle={styles.title}
        left={(props) => <IconButton {...props} icon="account" />}
      />
      <Card.Content>
        <View style={styles.infoRow}>
          <IconButton icon="map-marker" size={20} />
          <Text style={styles.text}>{address}</Text>
        </View>
        <View style={styles.infoRow}>
          <IconButton icon="phone" size={20} />
          <Text style={styles.text}>{phone}</Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <IconButton icon="phone" onPress={handleCall} />
        <IconButton icon="map" onPress={handleMap} />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  text: {
    fontSize: 16,
    flex: 1,
    flexWrap: 'wrap',
  },
  actions: {
    justifyContent: 'flex-end',
  },
});

export default ContactCard;