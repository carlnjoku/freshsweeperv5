// components/cleaner/AboutMe.js

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import userService from '../../services/connection/userService';
import { tSafe } from '../../utils/tSafe';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

const MAX_CHARS = 500;

export default function AboutMe({
  userId,
  aboutme,
  update_aboutme,
  close_modal,
}) {
  const { theme } = useTheme();

  const [text, setText] = useState(aboutme || '');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(false);

  const styles = createStyles(theme);

  const characterCount = text.length;
  const charactersRemaining = MAX_CHARS - characterCount;

  const handleTextChange = (value) => {
    if (value.length <= MAX_CHARS) {
      setText(value);
    }
  };

  const handleGenerate = async () => {
    if (generating || saving) {
      return;
    }

    setGenerating(true);

    try {
      const response =
        await userService.generateCleanerBio(userId);

      const generatedBio =
        response?.data?.bio || '';

      if (generatedBio) {
        setText(generatedBio.slice(0, MAX_CHARS));
      } else {
        Alert.alert(
          tSafe('error_title', 'Error'),
          tSafe(
            'bio_generation_empty',
            'We could not generate a bio right now. Please try again.'
          )
        );
      }
    } catch (error) {
      console.error(
        'Error generating cleaner bio:',
        error
      );

      Alert.alert(
        tSafe('error_title', 'Error'),
        tSafe(
          'bio_generation_failed',
          'Failed to generate bio. Please try again.'
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (saving || generating) {
      return;
    }

    const trimmedText = text.trim();

    if (!trimmedText) {
      Alert.alert(
        tSafe('error_title', 'Oops!'),
        tSafe(
          'about_me_required',
          'Please enter something about yourself before saving.'
        )
      );
      return;
    }

    setSaving(true);

    try {
      const data = {
        userId,
        aboutme: trimmedText,
      };

      const response =
        await userService.updateCleanerAbout(data);

      const status = response?.status;

      if (status === 200) {
        update_aboutme(trimmedText);
        close_modal();
      } else {
        Alert.alert(
          tSafe('error_title', 'Oops!'),
          tSafe(
            'something_went_wrong',
            'Something went wrong, please try again.'
          )
        );
      }
    } catch (error) {
      console.error(
        'Error updating cleaner About Me:',
        error
      );

      Alert.alert(
        tSafe('error_title', 'Oops!'),
        tSafe(
          'something_went_wrong',
          'Something went wrong, please try again.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.keyboardContainer}
      >
        <View style={styles.modalContent}>
          {/* =========================
              HEADER
          ========================= */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons
                name="account-heart-outline"
                size={24}
                color={theme.brand.primary}
              />
            </View>

            <View style={styles.headerText}>
              <AppText style={styles.title}>
                {tSafe('about_me', 'About Me')}
              </AppText>

              <AppText style={styles.subtitle}>
                {tSafe(
                  'about_me_editor_subtitle',
                  'Tell clients a little about yourself'
                )}
              </AppText>
            </View>

            <TouchableOpacity
              onPress={close_modal}
              disabled={saving || generating}
              style={styles.closeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={tSafe(
                'close',
                'Close'
              )}
            >
              <MaterialIcons
                name="close"
                size={22}
                color={
                  saving || generating
                    ? theme.text.disabled
                    : theme.icon.default
                }
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
          >
            {/* =========================
                AI GENERATION
            ========================= */}
            <View style={styles.aiCard}>
              <View style={styles.aiIconContainer}>
                <MaterialIcons
                  name="auto-awesome"
                  size={22}
                  color={theme.brand.primary}
                />
              </View>

              <View style={styles.aiContent}>
                <AppText style={styles.aiTitle}>
                  {tSafe(
                    'generate_with_ai',
                    'Generate with AI'
                  )}
                </AppText>

                <AppText style={styles.aiDescription}>
                  {tSafe(
                    'generate_bio_description',
                    'Let AI create a professional introduction based on your cleaner profile.'
                  )}
                </AppText>
              </View>

              <TouchableOpacity
                style={[
                  styles.aiButton,
                  (generating || saving) &&
                    styles.disabledButton,
                ]}
                onPress={handleGenerate}
                disabled={generating || saving}
                activeOpacity={0.75}
              >
                {generating ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.button.primaryText}
                  />
                ) : (
                  <MaterialIcons
                    name="auto-awesome"
                    size={18}
                    color={theme.button.primaryText}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* =========================
                EDITOR LABEL
            ========================= */}
            <View style={styles.editorHeader}>
              <View style={styles.editorLabelRow}>
                <MaterialCommunityIcons
                  name="text-box-edit-outline"
                  size={18}
                  color={theme.icon.default}
                />

                <AppText style={styles.editorLabel}>
                  {tSafe(
                    'your_description',
                    'Your Description'
                  )}
                </AppText>
              </View>

              <AppText
                style={[
                  styles.characterCount,
                  charactersRemaining < 50 &&
                    styles.characterCountWarning,
                  charactersRemaining < 0 &&
                    styles.characterCountError,
                ]}
              >
                {characterCount}/{MAX_CHARS}
              </AppText>
            </View>

            {/* =========================
                TEXT EDITOR
            ========================= */}
            <View
              style={[
                styles.inputContainer,
                focused &&
                  styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={styles.textInput}
                multiline
                placeholder={tSafe(
                  'write_about_yourself',
                  'Write about yourself...'
                )}
                placeholderTextColor={
                  theme.input.placeholder
                }
                value={text}
                onChangeText={handleTextChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                textAlignVertical="top"
                maxLength={MAX_CHARS}
                editable={!saving}
                selectionColor={theme.input.focus}
                autoCorrect
              />

              <View style={styles.inputFooter}>
                <View
                  style={styles.inputHintContainer}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={14}
                    color={theme.icon.muted}
                  />

                  <AppText style={styles.inputHint}>
                    {tSafe(
                      'about_me_hint',
                      'Keep it friendly, professional, and personal.'
                    )}
                  </AppText>
                </View>
              </View>
            </View>

            {/* =========================
                PREVIEW / STATUS
            ========================= */}
            {text.trim().length > 0 && (
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={18}
                    color={theme.icon.default}
                  />

                  <AppText style={styles.previewTitle}>
                    {tSafe(
                      'profile_preview',
                      'Profile Preview'
                    )}
                  </AppText>
                </View>

                <AppText
                  style={styles.previewText}
                  numberOfLines={4}
                >
                  {text.trim()}
                </AppText>
              </View>
            )}
          </ScrollView>

          {/* =========================
              ACTIONS
          ========================= */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
              ]}
              onPress={close_modal}
              disabled={saving || generating}
              activeOpacity={0.75}
            >
              <AppText
                style={[
                  styles.cancelButtonText,
                  (saving || generating) &&
                    styles.disabledText,
                ]}
              >
                {tSafe('cancel', 'Cancel')}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (saving ||
                  generating ||
                  !text.trim()) &&
                  styles.disabledSaveButton,
              ]}
              onPress={handleSave}
              disabled={
                saving ||
                generating ||
                !text.trim()
              }
              activeOpacity={0.75}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={theme.button.primaryText}
                />
              ) : (
                <>
                  <MaterialIcons
                    name="check"
                    size={19}
                    color={
                      theme.button.primaryText
                    }
                  />

                  <AppText
                    style={styles.saveButtonText}
                  >
                    {tSafe('save', 'Save')}
                  </AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.overlay || 'rgba(0,0,0,0.55)',
      paddingHorizontal: 16,
    },

    keyboardContainer: {
      width: '100%',
      maxWidth: 440,
      maxHeight: '92%',
    },

    modalContent: {
      width: '100%',
      maxHeight: '100%',
      backgroundColor: theme.surface.elevated,
      borderRadius: 24,
      overflow: 'hidden',

      borderWidth: 1,
      borderColor: theme.card.border,

      shadowColor:
        theme.shadow?.color || '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity:
        theme.shadow?.opacity || 0.15,
      shadowRadius: 20,

      elevation: 10,
    },

    /* =========================
       HEADER
    ========================= */

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    headerIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 12,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 21,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 3,
    },

    subtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: theme.text.secondary,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.surface.selected,
      marginLeft: 8,
    },

    /* =========================
       SCROLL CONTENT
    ========================= */

    scrollContent: {
      padding: 20,
      paddingBottom: 12,
    },

    /* =========================
       AI CARD
    ========================= */

    aiCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 16,
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
      marginBottom: 22,
    },

    aiIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.brand.primaryLight,
      marginRight: 12,
    },

    aiContent: {
      flex: 1,
      paddingRight: 8,
    },

    aiTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 3,
    },

    aiDescription: {
      fontSize: 11,
      lineHeight: 16,
      color: theme.text.secondary,
    },

    aiButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.button.primaryBackground,
    },

    /* =========================
       EDITOR HEADER
    ========================= */

    editorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 9,
    },

    editorLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    editorLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
    },

    characterCount: {
      fontSize: 11,
      color: theme.text.muted,
    },

    characterCountWarning: {
      color: theme.status.warning,
    },

    characterCountError: {
      color: theme.status.error,
    },

    /* =========================
       TEXT INPUT
    ========================= */

    inputContainer: {
      minHeight: 155,
      borderWidth: 1,
      borderColor: theme.input.border,
      borderRadius: 16,
      backgroundColor: theme.input.background,
      overflow: 'hidden',
    },

    inputContainerFocused: {
      borderColor: theme.input.focus,
      borderWidth: 2,
    },

    textInput: {
      flex: 1,
      minHeight: 125,
      paddingHorizontal: 15,
      paddingTop: 14,
      paddingBottom: 10,
      fontSize: 15,
      lineHeight: 22,
      color: theme.input.text,
      textAlignVertical: 'top',
    },

    inputFooter: {
      paddingHorizontal: 13,
      paddingBottom: 10,
    },

    inputHintContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    inputHint: {
      flex: 1,
      fontSize: 10,
      color: theme.text.muted,
    },

    /* =========================
       PREVIEW
    ========================= */

    previewCard: {
      marginTop: 18,
      padding: 14,
      borderRadius: 15,
      backgroundColor:
        theme.card.background,
      borderWidth: 1,
      borderColor: theme.card.border,
    },

    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 7,
    },

    previewTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.primary,
    },

    previewText: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.text.secondary,
    },

    /* =========================
       ACTION BUTTONS
    ========================= */

    buttonRow: {
      flexDirection: 'row',
      padding: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
      backgroundColor:
        theme.surface.elevated,
    },

    button: {
      minHeight: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },

    cancelButton: {
      flex: 0.85,
      marginRight: 8,
      backgroundColor:
        theme.surface.selected,
      borderWidth: 1,
      borderColor: theme.border.default,
    },

    saveButton: {
      flex: 1.15,
      marginLeft: 8,
      backgroundColor:
        theme.button.primaryBackground,
      gap: 7,
    },

    disabledSaveButton: {
      backgroundColor:
        theme.button.disabledBackground,
    },

    cancelButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },

    saveButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primaryText,
    },

    disabledText: {
      color: theme.text.disabled,
    },

    disabledButton: {
      opacity: 0.6,
    },
  });