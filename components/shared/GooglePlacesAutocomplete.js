import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { TextInput } from 'react-native-paper';

import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const GoogleAutocomplete = ({
  label,
  apiKey,
  selected_address,
  handleError,
  initialValue,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [query, setQuery] = useState(initialValue || '');
  const [predictions, setPredictions] = useState([]);
  const [apiState, setApiState] = useState({
    loading: false,
    error: null,
    showManual: false,
  });
  const [isFocused, setIsFocused] = useState(false);

  // Sync when the parent changes the initial value.
  useEffect(() => {
    if (initialValue !== query) {
      setQuery(initialValue || '');
    }
  }, [initialValue]);

  const handlePlaceSelected = async (input) => {
    setQuery(input);

    if (input.length < 2) {
      setPredictions([]);
      setApiState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        showManual: false,
      }));
      return;
    }

    setApiState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      showManual: false,
    }));

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/autocomplete/json',
        {
          params: {
            input,
            key: apiKey,
            types: 'address',
            language: 'en',
          },
        }
      );

      switch (response.data.status) {
        case 'ZERO_RESULTS':
          setApiState({
            loading: false,
            error: 'NO_RESULTS',
            showManual: true,
          });
          setPredictions([]);
          handleError?.('NO_RESULTS');
          break;

        case 'OK':
          if (response.data.predictions?.length > 0) {
            setPredictions(response.data.predictions);

            setApiState({
              loading: false,
              error: null,
              showManual: false,
            });
          } else {
            setPredictions([]);

            setApiState({
              loading: false,
              error: 'NO_RESULTS',
              showManual: true,
            });

            handleError?.('NO_RESULTS');
          }
          break;

        case 'OVER_QUERY_LIMIT':
        case 'REQUEST_DENIED':
        case 'INVALID_REQUEST':
          setPredictions([]);

          setApiState({
            loading: false,
            error: response.data.status,
            showManual: true,
          });

          handleError?.(response.data.status);
          break;

        default:
          setPredictions([]);

          setApiState({
            loading: false,
            error: 'API_ERROR',
            showManual: true,
          });

          handleError?.('API_ERROR');
      }
    } catch (error) {
      const errorType = axios.isCancel(error)
        ? 'REQUEST_CANCELED'
        : 'NETWORK_ERROR';

      setPredictions([]);

      setApiState({
        loading: false,
        error: errorType,
        showManual: true,
      });

      handleError?.(errorType);
    }
  };

  const selectPrediction = (address) => {
    setQuery(address);

    selected_address?.(address);

    setPredictions([]);

    setApiState({
      loading: false,
      error: null,
      showManual: false,
    });

    setIsFocused(false);
  };

  const handleManualChange = (text) => {
    setQuery(text);

    selected_address?.(text);

    if (text.length > 0) {
      handleError?.(null);
    }
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);

    setApiState({
      loading: false,
      error: null,
      showManual: false,
    });

    selected_address?.('');
    handleError?.(null);

    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    handleError?.(null, 'location');
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getErrorMessage = () => {
    const messages = {
      NO_RESULTS: 'Address not found — please enter manually',
      NETWORK_ERROR: 'Network issue — check your connection',
      OVER_QUERY_LIMIT: 'Service limit reached — try again later',
      INVALID_REQUEST: 'Invalid request — please check input',
      REQUEST_DENIED: 'Address lookup is unavailable — enter manually',
      API_ERROR: 'Service unavailable — enter manually',
    };

    return (
      messages[apiState.error] ||
      'Address lookup failed — enter manually'
    );
  };

  const renderPrediction = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => selectPrediction(item.description)}
      style={styles.predictionItem}
    >
      <AppText
        variant="body"
        style={styles.predictionText}
      >
        {item.description}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={label}
        label={label}
        mode="outlined"
        multiline
        value={query}
        onChangeText={handlePlaceSelected}
        onFocus={handleFocus}
        onBlur={handleBlur}
        textColor={theme.input.text}
        placeholderTextColor={theme.input.placeholder}
        outlineColor={theme.input.border}
        activeOutlineColor={theme.input.focus}
        cursorColor={theme.brand.primary}
        selectionColor={theme.brand.primary}
        theme={{
          roundness: 16,
          colors: {
            primary: theme.input.focus,
            outline: theme.input.border,
            background: theme.input.background,
            onSurfaceVariant: theme.input.placeholder,
          },
        }}
        style={styles.input}
        right={
          isFocused && query.length > 0 ? (
            <TextInput.Icon
              icon="close-circle"
              onPress={handleClear}
              color={theme.icon.muted}
            />
          ) : null
        }
      />

      {apiState.loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={theme.brand.primary}
          />

          <AppText
            variant="caption"
            style={styles.loadingText}
          >
            Searching addresses...
          </AppText>
        </View>
      )}

      {!apiState.loading && predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderPrediction}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}

      {apiState.showManual && (
        <View style={styles.manualContainer}>
          <View style={styles.manualHeader}>
            <AppText
              variant="caption"
              style={styles.manualTitle}
            >
              Enter address manually
            </AppText>

            <AppText
              variant="caption"
              style={styles.manualSubtitle}
            >
              We couldn't find your address automatically.
            </AppText>
          </View>

          <TextInput
            placeholder="Enter address manually"
            label={label}
            mode="outlined"
            multiline
            value={query}
            onChangeText={handleManualChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            textColor={theme.input.text}
            placeholderTextColor={theme.input.placeholder}
            outlineColor={theme.input.border}
            activeOutlineColor={theme.input.focus}
            cursorColor={theme.brand.primary}
            selectionColor={theme.brand.primary}
            theme={{
              roundness: 16,
              colors: {
                primary: theme.input.focus,
                outline: theme.input.border,
                background: theme.input.background,
                onSurfaceVariant: theme.input.placeholder,
              },
            }}
            style={styles.manualInput}
            right={
              isFocused && query.length > 0 ? (
                <TextInput.Icon
                  icon="close-circle"
                  onPress={handleClear}
                  color={theme.icon.muted}
                />
              ) : null
            }
          />

          {apiState.error && (
            <View style={styles.errorContainer}>
              <AppText
                variant="caption"
                style={styles.errorText}
              >
                {getErrorMessage()}
              </AppText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },

    input: {
      marginTop: 10,
      marginBottom: 0,
      backgroundColor: theme.input.background,
      fontSize: 14,
      minHeight: 56,
    },

    manualInput: {
      marginTop: 8,
      marginBottom: 0,
      backgroundColor: theme.input.background,
      fontSize: 14,
      minHeight: 56,
    },

    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
      gap: 8,
    },

    loadingText: {
      color: theme.text.muted,
    },

    predictionsContainer: {
      marginTop: 6,
      borderWidth: 1,
      borderColor: theme.border.default,
      borderRadius: 12,
      backgroundColor: theme.surface.elevated,
      overflow: 'hidden',
      maxHeight: 220,
    },

    predictionItem: {
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      backgroundColor: theme.surface.elevated,
    },

    predictionText: {
      color: theme.text.primary,
      fontSize: 14,
      lineHeight: 20,
    },

    manualContainer: {
      marginTop: 12,
      padding: 12,
      borderRadius: 14,
      backgroundColor: theme.background.sunken,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    manualHeader: {
      marginBottom: 2,
    },

    manualTitle: {
      color: theme.text.primary,
      fontWeight: '600',
      marginBottom: 2,
    },

    manualSubtitle: {
      color: theme.text.muted,
      lineHeight: 17,
    },

    errorContainer: {
      marginTop: 7,
      paddingHorizontal: 2,
    },

    errorText: {
      color: theme.status.error,
      lineHeight: 17,
    },
  });

export default GoogleAutocomplete;