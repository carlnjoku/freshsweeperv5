// components/ErrorBoundary.js
import React, { Component } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import * as Updates from 'expo-updates';
import { useError } from '../../context/ErrorContext';

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    console.error('ErrorBoundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  resetErrorBoundary = () => {
    this.props.clearGlobalError?.();
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    this.props.onReset?.();
  };

  reloadApp = async () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      await Updates.reloadAsync();
    }
  };

  renderFallback() {
    if (this.props.fallback) {
      return React.cloneElement(this.props.fallback, {
        error: this.state.error,
        resetError: this.resetErrorBoundary,
        reloadApp: this.reloadApp,
      });
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>😔 Something Went Wrong</Text>
        <Text style={styles.subtitle}>
          We encountered an unexpected error
        </Text>
        
        <View style={styles.errorDetails}>
          <Text style={styles.errorLabel}>Error:</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={this.resetErrorBoundary}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={this.reloadApp}
          >
            <Text style={styles.secondaryButtonText}>Restart App</Text>
          </TouchableOpacity>
        </View>

        {__DEV__ && this.state.errorInfo && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Component Stack:</Text>
            <Text style={styles.debugText}>
              {this.state.errorInfo.componentStack}
            </Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    return this.props.children;
  }
}

// Hook-based wrapper
export const ErrorBoundary = (props) => {
  const { clearError } = useError();
  
  return (
    <ErrorBoundaryClass 
      {...props} 
      clearGlobalError={clearError}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorDetails: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#dc3545',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  debugContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#212529',
    borderRadius: 8,
    width: '100%',
    maxHeight: 200,
  },
  debugTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  debugText: {
    color: '#adb5bd',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ErrorBoundary;