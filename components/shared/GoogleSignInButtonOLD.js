// components/auth/GoogleSignInButton.js
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

const GoogleSignInButton = ({ onPress, loading, disabled, userType }) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                disabled && styles.buttonDisabled,
                loading && styles.buttonLoading
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="#DB4437" />
            ) : (
                <View style={styles.buttonContent}>
                    <MaterialCommunityIcons 
                        name="google" 
                        size={24} 
                        color="#DB4437" 
                    />
                    <Text style={styles.buttonText}>
                        Continue with Google
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonLoading: {
        opacity: 0.8,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default GoogleSignInButton;