// components/GlobalErrorModal.js
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { useError } from '../../context/ErrorContext';

const GlobalErrorModal = () => {
  const { error, showErrorModal, clearError } = useError();

  if (!showErrorModal || !error) return null;

  const getErrorColor = (type) => {
    switch (type) {
      case 'NETWORK_ERROR': return '#ff9500';
      case 'AUTH_ERROR': return '#ff3b30';
      case 'API_ERROR': return '#5856d6';
      default: return '#8e8e93';
    }
  };

  return (
    <Modal
      transparent
      visible={showErrorModal}
      animationType="fade"
      onRequestClose={clearError}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.header, { backgroundColor: getErrorColor(error.type) }]}>
            <Text style={styles.headerTitle}>
              {error.type.replace('_', ' ')}
            </Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.message}>{error.message}</Text>
            
            {error.metadata && Object.keys(error.metadata).length > 0 && (
              <View style={styles.metadataContainer}>
                <Text style={styles.metadataTitle}>Details:</Text>
                {Object.entries(error.metadata).map(([key, value]) => (
                  <Text key={key} style={styles.metadataText}>
                    {key}: {JSON.stringify(value)}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.timestamp}>
              {error.timestamp.toLocaleTimeString()}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            {error.recoverable && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={clearError}
              >
                <Text style={styles.buttonText}>Dismiss</Text>
              </TouchableOpacity>
            )}
            
            {!error.recoverable && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={clearError}
                >
                  <Text style={styles.secondaryButtonText}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    clearError();
                    // Add navigation logic here
                    // navigation.navigate('Login');
                  }}
                >
                  <Text style={styles.buttonText}>Go to Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    padding: 20,
    maxHeight: 300,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  metadataContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  metadataTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  metadataText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GlobalErrorModal;