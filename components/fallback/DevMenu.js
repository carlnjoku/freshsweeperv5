// components/fallback/DevMenu.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  Platform,
  Vibration
} from 'react-native';
import ErrorTest from './ErrorTest';

const DevMenu = () => {
  const [visible, setVisible] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    if (!__DEV__) return;

    // Simple shake detection (you might want to use react-native-shake for production)
    let lastShake = Date.now();
    let shakeTimeout;

    const handleShake = () => {
      const now = Date.now();
      if (now - lastShake < 1000) {
        setShakeCount(prev => prev + 1);
        
        if (shakeCount >= 2) {
          Vibration.vibrate(50);
          setVisible(true);
          setShakeCount(0);
        }
      } else {
        setShakeCount(1);
      }
      lastShake = now;
      
      clearTimeout(shakeTimeout);
      shakeTimeout = setTimeout(() => setShakeCount(0), 1000);
    };

    // Mock shake event for web/emulator
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
          handleShake();
        }
      });
    }

    // You can add actual shake detection here using react-native-shake
    
    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('keydown', handleShake);
      }
      clearTimeout(shakeTimeout);
    };
  }, [shakeCount]);

  if (!__DEV__) return null;

  return (
    <>
      {/* Dev Menu Trigger Button */}
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>🐛</Text>
      </TouchableOpacity>

      {/* Dev Menu Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ErrorTest onClose={() => setVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  triggerText: {
    fontSize: 24,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    flex: 1,
    marginTop: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});

export default DevMenu;