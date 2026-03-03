// components/fallback/ErrorTest.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Button, 
  StyleSheet, 
  Alert,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useError } from '../../context/ErrorContext';

const ErrorTest = ({ onClose }) => {
  const { 
    setError, 
    handleError, 
    clearError,
    error,
    showErrorModal 
  } = useError();
  
  const [testResults, setTestResults] = useState([]);
  const [autoClear, setAutoClear] = useState(true);
  const [delayMs, setDelayMs] = useState(1000);

  const addTestResult = (testName, success, details = '') => {
    setTestResults(prev => [
      { 
        id: Date.now().toString(),
        name: testName, 
        success, 
        details,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  // Test 1: Basic React render error (ErrorBoundary)
  const testRenderError = () => {
    addTestResult('React Render Error', 'triggered', 'Will be caught by ErrorBoundary');
    
    // This will be caught by ErrorBoundary
    throw new Error('Test React render error triggered at ' + new Date().toLocaleTimeString());
  };

  // Test 2: Global error via setError
  const testGlobalError = () => {
    setError({
      type: 'TEST_ERROR',
      message: 'This is a test global error for error handling system',
      metadata: { 
        code: 500, 
        timestamp: new Date().toISOString(),
        debugInfo: 'User initiated test error',
        testId: 'global-error-test-001'
      },
      recoverable: true,
    });
    
    addTestResult('Global Error Modal', 'triggered', 'Should show modal with TEST_ERROR type');
    
    if (autoClear) {
      setTimeout(() => {
        clearError();
        addTestResult('Global Error Modal', 'cleared', 'Auto-cleared after ' + delayMs + 'ms');
      }, delayMs);
    }
  };

  // Test 3: Network error via handleError
  const testNetworkError = () => {
    handleError(new Error('Network request failed: Cannot reach server'), 'NETWORK_ERROR');
    addTestResult('Network Error', 'triggered', 'Orange-colored modal should appear');
  };

  // Test 4: Auth error (non-recoverable)
  const testAuthError = () => {
    handleError(new Error('Session expired. Please log in again.'), 'AUTH_ERROR');
    addTestResult('Auth Error', 'triggered', 'Red-colored modal, non-recoverable');
  };

  // Test 5: API error with metadata
  const testAPIError = () => {
    const mockError = new Error('Failed to fetch user data');
    mockError.statusCode = 404;
    mockError.endpoint = '/api/users/123';
    handleError(mockError, 'API_ERROR');
    addTestResult('API Error', 'triggered', 'Purple-colored modal with status code');
  };

  // Test 6: Multiple rapid errors
  const testRapidErrors = () => {
    addTestResult('Rapid Errors', 'starting', 'Triggering 3 errors in sequence');
    
    // Error 1
    handleError(new Error('First rapid error'), 'API_ERROR');
    
    setTimeout(() => {
      // Error 2
      handleError(new Error('Second rapid error'), 'NETWORK_ERROR');
      addTestResult('Rapid Errors', 'second', 'Second error triggered');
      
      setTimeout(() => {
        // Error 3
        handleError(new Error('Third rapid error'), 'TEST_ERROR');
        addTestResult('Rapid Errors', 'third', 'Third error triggered');
        
        setTimeout(() => {
          clearError();
          addTestResult('Rapid Errors', 'completed', 'All errors cleared');
        }, 500);
      }, 300);
    }, 300);
  };

  // Test 7: Error with long message
  const testLongErrorMessage = () => {
    const longMessage = 'This is a very long error message that should test the scrolling capabilities of the error modal. It contains multiple sentences to ensure that the modal can handle lengthy error descriptions properly. ' +
      'The error details are important for debugging but should not break the UI.';
    
    setError({
      type: 'VALIDATION_ERROR',
      message: longMessage,
      metadata: {
        field: 'email',
        validation: 'invalid_format',
        suggestions: ['Use valid email format', 'Check for typos']
      },
      recoverable: true
    });
    
    addTestResult('Long Error Message', 'triggered', 'Should show scrollable content');
  };

  // Test 8: Clear current error
  const testClearError = () => {
    clearError();
    addTestResult('Clear Error', 'executed', 'Current error cleared manually');
  };

  // Test 9: Error in useEffect (simulate)
  const testUseEffectError = () => {
    // Simulate an error that might occur in useEffect
    setTimeout(() => {
      handleError(
        new Error('Data fetch failed in useEffect'),
        'API_ERROR'
      );
      addTestResult('useEffect Error', 'simulated', 'Error triggered after timeout');
    }, 500);
  };

  // Test 10: Test error boundary recovery
  const testErrorBoundaryRecovery = async () => {
    // Create a component that will error
    const ErrorComponent = () => {
      throw new Error('ErrorBoundary recovery test');
    };
    
    // Note: In real test, you'd render this component
    addTestResult('ErrorBoundary Recovery', 'info', 'Would need separate test component');
    Alert.alert(
      'ErrorBoundary Recovery Test',
      'This would test the "Try Again" and "Restart App" buttons in the ErrorBoundary fallback UI.'
    );
  };

  // Run all tests
  const runAllTests = () => {
    addTestResult('Test Suite', 'starting', 'Running all error tests...');
    
    const tests = [
      { name: 'Global Error', func: testGlobalError, delay: 500 },
      { name: 'Network Error', func: testNetworkError, delay: 1000 },
      { name: 'Auth Error', func: testAuthError, delay: 1500 },
      { name: 'API Error', func: testAPIError, delay: 2000 },
      { name: 'Long Message', func: testLongErrorMessage, delay: 2500 },
    ];
    
    tests.forEach((test, index) => {
      setTimeout(() => {
        test.func();
      }, test.delay);
    });
    
    setTimeout(() => {
      clearError();
      addTestResult('Test Suite', 'completed', 'All tests finished, errors cleared');
    }, 3000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Error Handling Tests</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Current Error: {error ? error.type : 'None'}
        </Text>
        <Text style={styles.statusText}>
          Modal Visible: {showErrorModal ? 'Yes' : 'No'}
        </Text>
      </View>
      
      <View style={styles.settingsContainer}>
        <View style={styles.settingRow}>
          <Text>Auto-clear errors after {delayMs}ms</Text>
          <Switch value={autoClear} onValueChange={setAutoClear} />
        </View>
      </View>
      
      <View style={styles.testGrid}>
        <Button title="Test Render Error" onPress={testRenderError} color="#FF3B30" />
        <Button title="Test Global Error" onPress={testGlobalError} color="#007AFF" />
        <Button title="Test Network Error" onPress={testNetworkError} color="#FF9500" />
        <Button title="Test Auth Error" onPress={testAuthError} color="#FF2D55" />
        <Button title="Test API Error" onPress={testAPIError} color="#5856D6" />
        <Button title="Test Long Message" onPress={testLongErrorMessage} color="#34C759" />
        <Button title="Test Rapid Errors" onPress={testRapidErrors} color="#AF52DE" />
        <Button title="Test useEffect Error" onPress={testUseEffectError} color="#FFCC00" />
        <Button title="Clear Current Error" onPress={testClearError} color="#8E8E93" />
        <Button title="Run All Tests" onPress={runAllTests} color="#000" />
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results ({testResults.length})</Text>
        {testResults.map((result) => (
          <View 
            key={result.id} 
            style={[
              styles.resultItem,
              { 
                backgroundColor: result.success === 'triggered' ? '#FFF3CD' : 
                                result.success === 'cleared' ? '#D4EDDA' : 
                                result.success === 'starting' ? '#D1ECF1' : '#F8D7DA'
              }
            ]}
          >
            <Text style={styles.resultName}>
              {result.name} • {result.timestamp}
            </Text>
            <Text style={styles.resultDetails}>
              Status: {result.success} • {result.details}
            </Text>
          </View>
        ))}
        
        {testResults.length === 0 && (
          <Text style={styles.noResults}>No tests run yet. Click buttons above to test.</Text>
        )}
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>What to Test:</Text>
        <Text style={styles.instruction}>1. Click "Test Render Error" - Should show ErrorBoundary UI</Text>
        <Text style={styles.instruction}>2. Click any error button - Should show GlobalErrorModal</Text>
        <Text style={styles.instruction}>3. Verify colors match error types</Text>
        <Text style={styles.instruction}>4. Test "Dismiss" and "Continue" buttons</Text>
        <Text style={styles.instruction}>5. Check console for error logs</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  resultsContainer: {
    margin: 16,
    marginTop: 0,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  resultItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  instructions: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0D47A1',
  },
  instruction: {
    fontSize: 13,
    color: '#1565C0',
    marginBottom: 4,
  },
});

export default ErrorTest;