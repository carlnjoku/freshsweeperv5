import React, { useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';

import {
  Appbar,
  IconButton,
  Surface,
  Divider,
  FAB,
  Chip,
} from 'react-native-paper';

import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

import {
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

import { tSafe } from '../../utils/tSafe';
import ROUTES from '../../constants/routes';
import { useTheme } from '../../theme';
import AppText from '../../ui/AppText';

// =========================================================
// Helper
// =========================================================

const withAlpha = (color, alpha) => {
  if (!color) return color;

  // Supports normal hex colors such as #3B82F6
  if (
    typeof color === 'string' &&
    color.startsWith('#') &&
    color.length === 7
  ) {
    return `${color}${alpha}`;
  }

  return color;
};

// =========================================================
// WebView Modal
// =========================================================

const WebHelpModal = ({
  visible,
  url,
  title,
  onClose,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  if (!url) return null;

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.webviewContainer}>
        <Appbar.Header style={styles.webviewHeader}>
          <Appbar.BackAction
            onPress={onClose}
            color={theme.icon.default}
          />

          <Appbar.Content
            title={title || 'Help Center'}
            titleStyle={styles.webviewTitle}
          />

          <Appbar.Action
            icon="open-in-new"
            onPress={() => Linking.openURL(url)}
            color={theme.icon.default}
          />
        </Appbar.Header>

        {loading && (
          <View style={styles.webviewLoader}>
            <ActivityIndicator
              size="large"
              color={theme.brand.primary}
            />

            <AppText style={styles.loadingText}>
              Loading help content...
            </AppText>
          </View>
        )}

        {error && (
          <View style={styles.webviewError}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={60}
              color={theme.icon.muted}
            />

            <AppText
              variant="subtitle"
              style={styles.errorTitle}
            >
              Unable to load content
            </AppText>

            <AppText style={styles.errorText}>
              Please check your internet connection
            </AppText>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <AppText style={styles.retryText}>
                Retry
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        <WebView
          key={reloadKey}
          source={{ uri: url }}
          style={[
            styles.webview,
            {
              opacity: loading ? 0 : 1,
            },
          ]}
          onLoadStart={() => {
            setLoading(true);
            setError(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState={false}
        />
      </View>
    </Modal>
  );
};

// =========================================================
// FAQ Item
// =========================================================

const HostFAQItem = ({
  question,
  answer,
  articleUrl,
  icon,
  category,
  index,
  onReadMore,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [expanded, setExpanded] = useState(false);

  const animation = useRef(
    new Animated.Value(0)
  ).current;

  const heightAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const toggleAccordion = () => {
    const nextValue = expanded ? 0 : 1;

    Animated.parallel([
      Animated.timing(animation, {
        toValue: nextValue,
        duration: 300,
        useNativeDriver: false,
      }),

      Animated.timing(heightAnimation, {
        toValue: nextValue,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    setExpanded(!expanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const scaleInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'scheduling':
        return theme.brand.primary;

      case 'payment':
        return theme.status.success;

      case 'cleaner':
        return theme.status.warning;

      case 'property':
        return theme.status.info;

      case 'emergency':
        return theme.status.error;

      default:
        return theme.brand.primary;
    }
  };

  const categoryColor = getCategoryColor(category);

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: scaleInterpolate,
          },
        ],
      }}
    >
      <Surface
        style={styles.faqCard}
        elevation={expanded ? 4 : 2}
      >
        <TouchableOpacity
          onPress={toggleAccordion}
          activeOpacity={0.7}
        >
          <View style={styles.faqHeader}>
            <View
              style={[
                styles.faqIconContainer,
                {
                  backgroundColor:
                    withAlpha(categoryColor, '15'),
                },
              ]}
            >
              <MaterialCommunityIcons
                name={icon}
                size={22}
                color={categoryColor}
              />
            </View>

            <View style={styles.faqContent}>
              <View style={styles.faqHeaderTop}>
                <Chip
                  mode="outlined"
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: categoryColor,
                    },
                  ]}
                  textStyle={{
                    color: categoryColor,
                    fontSize: 10,
                  }}
                >
                  {category.toUpperCase()}
                </Chip>

                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: rotateInterpolate,
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name="chevron-down"
                    size={24}
                    color={theme.icon.muted}
                  />
                </Animated.View>
              </View>

              <AppText
                variant="subtitle"
                style={styles.faqQuestion}
                numberOfLines={2}
              >
                {question}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>

        {expanded && (
          <Animated.View
            style={[
              styles.faqAnswerContainer,
              {
                opacity: animation,
                transform: [
                  {
                    translateY:
                      animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                  },
                ],
              },
            ]}
          >
            <Divider style={styles.faqDivider} />

            {/* Short Answer */}
            <View style={styles.answerContent}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={20}
                color={theme.status.warning}
                style={styles.answerIcon}
              />

              <AppText style={styles.faqAnswer}>
                {answer}
              </AppText>
            </View>

            {/* Read More */}
            {articleUrl && (
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() =>
                  onReadMore(
                    articleUrl,
                    question
                  )
                }
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[
                    withAlpha(
                      theme.brand.primary,
                      '20'
                    ),
                    withAlpha(
                      theme.brand.primary,
                      '10'
                    ),
                  ]}
                  style={styles.readMoreGradient}
                >
                  <AppText
                    style={styles.readMoreText}
                  >
                    Read detailed guide with screenshots →
                  </AppText>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={theme.brand.primary}
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Feedback */}
            <View style={styles.feedbackContainer}>
              <AppText
                style={styles.feedbackLabel}
              >
                Was this helpful?
              </AppText>

              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={styles.feedbackButton}
                >
                  <MaterialCommunityIcons
                    name="thumb-up-outline"
                    size={18}
                    color={theme.status.success}
                  />

                  <AppText
                    style={styles.feedbackText}
                  >
                    Yes
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.feedbackButton}
                >
                  <MaterialCommunityIcons
                    name="thumb-down-outline"
                    size={18}
                    color={theme.status.error}
                  />

                  <AppText
                    style={styles.feedbackText}
                  >
                    No
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </Surface>
    </Animated.View>
  );
};

// =========================================================
// Host Support
// =========================================================

const HostSupport = ({ navigation }) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState('all');

  const [webViewVisible, setWebViewVisible] =
    useState(false);

  const [currentArticle, setCurrentArticle] =
    useState({
      url: '',
      title: '',
    });

  const [showHelpCenter, setShowHelpCenter] =
    useState(false);

  // =======================================================
  // FAQ DATA
  // =======================================================

  const hostFAQs = [
    {
      id: 1,
      question: tSafe(
        'faq_host_create_schedule_q',
        'How do I create a cleaning schedule?'
      ),
      answer: tSafe(
        'faq_host_create_schedule_a',
        "Navigate to Dashboard → Properties → Select property → 'Create Schedule'. Basic setup takes 2 minutes. Set date, time, and frequency."
      ),
      articleUrl:
        'https://www.freshsweeper.com/faqs?category=scheduling',
      icon: 'calendar-plus',
      category: 'scheduling',
    },

    {
      id: 2,
      question: tSafe(
        'faq_host_select_cleaner_q',
        'Can I select a specific cleaner?'
      ),
      answer: tSafe(
        'faq_host_select_cleaner_a',
        "Yes! After creating a schedule, you'll see 'Choose Cleaner' option. Browse profiles, ratings, and reviews."
      ),
      articleUrl:
        'https://www.freshsweeper.com/faqs?category=cleaners',
      icon: 'account-check',
      category: 'cleaner',
    },

    {
      id: 3,
      question: tSafe(
        'faq_host_payment_q',
        'How does payment work?'
      ),
      answer: tSafe(
        'faq_host_payment_a',
        'Payments are processed securely via Stripe. You\'ll be charged after cleaning completion. View receipts in Payment History.'
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/payment-system',
      icon: 'credit-card-outline',
      category: 'payment',
    },

    {
      id: 4,
      question: tSafe(
        'faq_host_cancellation_cleaner_q',
        'What if my cleaner cancels last minute?'
      ),
      answer: tSafe(
        'faq_host_cancellation_cleaner_a',
        'We automatically notify backup cleaners. If no replacement found, you get 100% refund plus 20% off next booking.'
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/emergency-protocol',
      icon: 'account-alert',
      category: 'emergency',
    },

    {
      id: 5,
      question: tSafe(
        'faq_host_modify_booking_q',
        'How do I modify or cancel a booking?'
      ),
      answer: tSafe(
        'faq_host_modify_booking_a',
        "Go to Upcoming Schedules → Select booking → 'Modify' or 'Cancel'. Changes within 24hrs may incur fees."
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/modify-bookings',
      icon: 'calendar-edit',
      category: 'scheduling',
    },

    {
      id: 6,
      question: tSafe(
        'faq_host_special_instructions_q',
        'Can I add special instructions for cleaners?'
      ),
      answer: tSafe(
        'faq_host_special_instructions_a',
        "Absolutely. When creating/editing a schedule, use 'Special Instructions' field. Also add property-specific notes."
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/special-instructions',
      icon: 'note-text-outline',
      category: 'property',
    },

    {
      id: 7,
      question: tSafe(
        'faq_host_review_cleaner_q',
        'How do I review my cleaner?'
      ),
      answer: tSafe(
        'faq_host_review_cleaner_a',
        "After cleaning completion, you'll receive a review prompt. Rate 1-5 stars and add comments."
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/review-system',
      icon: 'star-outline',
      category: 'cleaner',
    },

    {
      id: 8,
      question: tSafe(
        'faq_host_standard_cleaning_q',
        "What's included in standard cleaning?"
      ),
      answer: tSafe(
        'faq_host_standard_cleaning_a',
        'Dusting, vacuuming, mopping, bathroom sanitization, kitchen cleaning, trash removal.'
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/cleaning-checklist',
      icon: 'checkbox-marked-outline',
      category: 'property',
    },

    {
      id: 9,
      question: tSafe(
        'faq_host_report_damage_q',
        'How do I report damage or issues?'
      ),
      answer: tSafe(
        'faq_host_report_damage_a',
        "Within 24hrs of cleaning, go to Schedule Details → 'Report Issue' → Upload photos/description."
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/report-damage',
      icon: 'alert-circle-outline',
      category: 'emergency',
    },

    {
      id: 10,
      question: tSafe(
        'faq_host_recurring_cleanings_q',
        'Can I schedule recurring cleanings?'
      ),
      answer: tSafe(
        'faq_host_recurring_cleanings_a',
        "Yes! Choose 'Recurring' when creating schedule. Set frequency (weekly, bi-weekly, monthly)."
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/recurring-cleanings',
      icon: 'repeat',
      category: 'scheduling',
    },

    {
      id: 11,
      question: tSafe(
        'faq_host_update_property_q',
        'How do I update my property details?'
      ),
      answer: tSafe(
        'faq_host_update_property_a',
        "Properties → Select property → 'Edit' → Update rooms, access instructions, parking info."
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/manage-properties',
      icon: 'home-edit',
      category: 'property',
    },

    {
      id: 12,
      question: tSafe(
        'faq_host_payment_methods_q',
        'What payment methods are accepted?'
      ),
      answer: tSafe(
        'faq_host_payment_methods_a_b',
        'All major credit/debit cards, Google Pay. Processed securely via Stripe.'
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/payment-methods',
      icon: 'wallet-outline',
      category: 'payment',
    },

    {
      id: 13,
      question: tSafe(
        'faq_host_video_tutorials_q',
        'Are there video tutorials available?'
      ),
      answer: tSafe(
        'faq_host_video_tutorials_a',
        'Yes! We have comprehensive video guides showing every feature in action.'
      ),
      articleUrl:
        'https://help.freshsweeper.com/hosts/video-tutorials',
      icon: 'video-outline',
      category: 'scheduling',
    },

    {
      id: 14,
      question: tSafe(
        'faq_host_api_access_q',
        'Is there an API for hosts?'
      ),
      answer: tSafe(
        'faq_host_api_access_a',
        'Yes, we offer REST API access for enterprise hosts. Contact support for API keys.'
      ),
      articleUrl:
        'https://developers.freshsweeper.com',
      icon: 'api',
      category: 'property',
    },
  ];

  // =======================================================
  // CATEGORIES
  // =======================================================

  const categories = [
    {
      id: 'all',
      label: tSafe(
        'category_all',
        'All Questions'
      ),
      icon: 'format-list-bulleted',
    },
    {
      id: 'scheduling',
      label: tSafe(
        'category_scheduling',
        'Scheduling'
      ),
      icon: 'calendar',
    },
    {
      id: 'payment',
      label: tSafe(
        'category_payment',
        'Payment'
      ),
      icon: 'credit-card',
    },
    {
      id: 'cleaner',
      label: tSafe(
        'category_cleaner',
        'Cleaners'
      ),
      icon: 'account-group',
    },
    {
      id: 'property',
      label: tSafe(
        'category_property',
        'Property'
      ),
      icon: 'home',
    },
    {
      id: 'emergency',
      label: tSafe(
        'category_emergency',
        'Emergency'
      ),
      icon: 'alert',
    },
  ];

  const filteredFAQs = hostFAQs.filter(
    (item) => {
      const normalizedSearch =
        searchQuery.toLowerCase();

      const matchesSearch =
        item.question
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.answer
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        activeCategory === 'all' ||
        item.category === activeCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  const handleReadMore = (url, title) => {
    setCurrentArticle({
      url,
      title,
    });

    setWebViewVisible(true);
  };

  // =======================================================
  // CONTACT METHODS
  // =======================================================

  const contactMethods = [
    {
      id: 1,
      title: tSafe(
        'contact_priority_support',
        'Priority Support'
      ),
      subtitle: tSafe(
        'contact_priority_subtitle',
        'Host-dedicated line'
      ),
      icon: 'headset',
      color: theme.brand.primary,
      action: () =>
        Linking.openURL(
          'tel:+18001234567'
        ),
      badge: tSafe(
        'badge_vip',
        'VIP'
      ),
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/priority-support',
    },

    {
      id: 2,
      title: tSafe(
        'contact_email_team',
        'Email Team'
      ),
      subtitle:
        'hosts@freshsweeper.com',
      icon: 'email-fast',
      color: theme.brand.secondary,
      action: () =>
        Linking.openURL(
          'mailto:hosts@freshsweeper.com'
        ),
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/email-support',
    },

    {
      id: 3,
      title: tSafe(
        'contact_live_chat',
        'Live Chat'
      ),
      subtitle: tSafe(
        'contact_live_chat_sub',
        'Instant response'
      ),
      icon: 'message-text',
      color: theme.status.warning,
      action: () =>
        navigation.navigate(
          'HostLiveChat'
        ),
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/live-chat',
    },

    {
      id: 4,
      title: tSafe(
        'contact_help_articles',
        'Help Articles'
      ),
      subtitle: tSafe(
        'contact_help_articles_sub',
        'Host guides & tips'
      ),
      icon: 'book-open-variant',
      color: theme.brand.primary,
      action: () =>
        setShowHelpCenter(true),
      webHelpUrl:
        'https://help.freshsweeper.com/hosts',
    },
  ];

  // =======================================================
  // QUICK ACTIONS
  // =======================================================

  const quickActions = [
    {
      id: 1,
      title: tSafe(
        'quick_action_report_issue',
        'Report Issue'
      ),
      icon: 'alert-circle',
      color: theme.status.error,
      screen: 'ReportIssue',
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/report-issue',
    },

    {
      id: 2,
      title: tSafe(
        'quick_action_cancel_booking',
        'Cancel Booking'
      ),
      icon: 'calendar-remove',
      color: theme.status.warning,
      screen: 'CancelBooking',
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/cancel-booking',
    },

    {
      id: 3,
      title: tSafe(
        'quick_action_modify_schedule',
        'Modify Schedule'
      ),
      icon: 'calendar-edit',
      color: theme.brand.primary,
      screen: 'ModifySchedule',
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/modify-schedule',
    },

    {
      id: 4,
      title: tSafe(
        'quick_action_payment_help',
        'Payment Help'
      ),
      icon: 'credit-card-refresh',
      color: theme.status.success,
      screen: 'PaymentSupport',
      webHelpUrl:
        'https://help.freshsweeper.com/hosts/payment-help',
    },
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <View style={styles.container}>
      {/* =================================================
          HEADER
      ================================================= */}

      <LinearGradient
        colors={[
          theme.brand.primary,
          theme.brand.secondary,
        ]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Appbar.Header
          style={styles.headerAppbar}
        >
          <Appbar.BackAction
            color={theme.text.inverse}
            onPress={() =>
              navigation.goBack()
            }
          />

          <Appbar.Content
            title={
              <View>
                <AppText
                  style={styles.headerTitle}
                >
                  {tSafe(
                    'host_support_title',
                    'Host Support'
                  )}
                </AppText>

                <AppText
                  style={styles.headerSubtitle}
                >
                  {tSafe(
                    'host_support_subtitle',
                    'Premium assistance for hosts'
                  )}
                </AppText>
              </View>
            }
          />

          <Appbar.Action
            icon="help-circle-outline"
            color={theme.text.inverse}
            onPress={() =>
              setShowHelpCenter(true)
            }
          />

          <Appbar.Action
            icon="bell-outline"
            color={theme.text.inverse}
            onPress={() =>
              navigation.navigate(
                ROUTES.notification
              )
            }
          />
        </Appbar.Header>

        <View style={styles.headerContent}>
          {/* Search */}
          <Surface
            style={styles.searchContainer}
            elevation={4}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.brand.primary}
              style={styles.searchIcon}
            />

            <TextInput
              style={styles.searchInput}
              placeholder={tSafe(
                'search_placeholder',
                'Search help articles...'
              )}
              placeholderTextColor={
                theme.input.placeholder
              }
              value={searchQuery}
              onChangeText={
                setSearchQuery
              }
              selectionColor={
                theme.input.focus
              }
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  setSearchQuery('')
                }
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.icon.muted}
                />
              </TouchableOpacity>
            )}
          </Surface>
        </View>
      </LinearGradient>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.contentContainer
        }
      >
        {/* Quick Actions */}
        <AppText
          variant="title"
          style={styles.sectionTitle}
        >
          {tSafe(
            'quick_actions_title',
            'Quick Actions'
          )}
        </AppText>

        <View
          style={styles.quickActionsGrid}
        >
          {quickActions.map(
            (action) => (
              <TouchableOpacity
                key={action.id}
                style={
                  styles.quickActionCard
                }
                onPress={() =>
                  navigation.navigate(
                    action.screen
                  )
                }
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    {
                      backgroundColor:
                        withAlpha(
                          action.color,
                          '20'
                        ),
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={24}
                    color={action.color}
                  />
                </View>

                <AppText
                  style={
                    styles.quickActionTitle
                  }
                >
                  {action.title}
                </AppText>

                {action.webHelpUrl && (
                  <TouchableOpacity
                    style={styles.helpIcon}
                    onPress={() =>
                      handleReadMore(
                        action.webHelpUrl,
                        action.title
                      )
                    }
                  />
                )}
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Contact Support */}
        <View
          style={styles.contactSection}
        >
          <View
            style={styles.sectionHeader}
          >
            <View style={styles.sectionHeaderText}>
              <AppText
                variant="title"
                style={styles.sectionTitle}
              >
                {tSafe(
                  'contact_support_title',
                  'Contact Support'
                )}
              </AppText>

              <AppText
                style={styles.sectionSubtitle}
              >
                {tSafe(
                  'contact_support_subtitle',
                  'Dedicated host team'
                )}
              </AppText>
            </View>
          </View>

          <View
            style={styles.contactGrid}
          >
            {contactMethods.map(
              (method) => (
                <TouchableOpacity
                  key={method.id}
                  style={
                    styles.contactCard
                  }
                  onPress={
                    method.action
                  }
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[
                      method.color,
                      withAlpha(
                        method.color,
                        'DD'
                      ),
                    ]}
                    style={
                      styles.contactGradient
                    }
                  >
                    <MaterialCommunityIcons
                      name={method.icon}
                      size={24}
                      color={
                        theme.text.inverse
                      }
                    />

                    {method.badge && (
                      <View
                        style={
                          styles.badge
                        }
                      >
                        <AppText
                          style={
                            styles.badgeText
                          }
                        >
                          {method.badge}
                        </AppText>
                      </View>
                    )}
                  </LinearGradient>

                  <AppText
                    style={
                      styles.contactTitle
                    }
                  >
                    {method.title}
                  </AppText>

                  <AppText
                    style={
                      styles.contactSubtitle
                    }
                  >
                    {method.subtitle}
                  </AppText>

                  {method.webHelpUrl && (
                    <TouchableOpacity
                      style={
                        styles.detailLink
                      }
                      onPress={() =>
                        handleReadMore(
                          method.webHelpUrl,
                          method.title
                        )
                      }
                    >
                      <AppText
                        style={
                          styles.detailLinkText
                        }
                      >
                        Learn more →
                      </AppText>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={
            styles.categoryScroll
          }
          contentContainerStyle={
            styles.categoryContainer
          }
        >
          {categories.map(
            (category) => {
              const isActive =
                activeCategory ===
                category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    isActive &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() =>
                    setActiveCategory(
                      category.id
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={
                      category.icon
                    }
                    size={16}
                    color={
                      isActive
                        ? theme.text.inverse
                        : theme.brand.primary
                    }
                    style={
                      styles.categoryIcon
                    }
                  />

                  <AppText
                    style={[
                      styles.categoryLabel,
                      isActive &&
                        styles.categoryLabelActive,
                    ]}
                  >
                    {category.label}
                  </AppText>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>

        {/* FAQ */}
        <View
          style={styles.faqSection}
        >
          <View
            style={styles.sectionHeader}
          >
            <View
              style={
                styles.sectionHeaderText
              }
            >
              <AppText
                variant="title"
                style={styles.sectionTitle}
              >
                {tSafe(
                  'faq_title',
                  'Frequently Asked Questions'
                )}
              </AppText>

              <AppText
                style={
                  styles.sectionSubtitle
                }
              >
                {filteredFAQs.length}{' '}
                {tSafe(
                  'questions_count',
                  'questions'
                )}{' '}
                •{' '}
                {activeCategory ===
                'all'
                  ? tSafe(
                      'all_categories',
                      'All categories'
                    )
                  : activeCategory}
              </AppText>
            </View>
          </View>

          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(
              (item, index) => (
                <HostFAQItem
                  key={item.id}
                  question={
                    item.question
                  }
                  answer={
                    item.answer
                  }
                  articleUrl={
                    item.articleUrl
                  }
                  icon={item.icon}
                  category={
                    item.category
                  }
                  index={index}
                  onReadMore={
                    handleReadMore
                  }
                />
              )
            )
          ) : (
            <Surface
              style={
                styles.noResultsCard
              }
              elevation={2}
            >
              <MaterialCommunityIcons
                name="magnify-close"
                size={60}
                color={
                  theme.icon.muted
                }
              />

              <AppText
                variant="subtitle"
                style={
                  styles.noResultsTitle
                }
              >
                {tSafe(
                  'no_results_title',
                  'No matches found'
                )}
              </AppText>

              <AppText
                style={
                  styles.noResultsText
                }
              >
                {tSafe(
                  'no_results_message',
                  'Try different keywords or select another category'
                )}
              </AppText>

              <TouchableOpacity
                style={
                  styles.viewAllButton
                }
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory(
                    'all'
                  );
                }}
              >
                <AppText
                  style={
                    styles.viewAllButtonText
                  }
                >
                  View all questions
                </AppText>
              </TouchableOpacity>
            </Surface>
          )}
        </View>

        {/* Video Tutorials */}
        <View
          style={styles.videoSection}
        >
          <View
            style={styles.sectionHeader}
          >
            <View>
              <AppText
                variant="title"
                style={styles.sectionTitle}
              >
                📹 Video Tutorials
              </AppText>

              <AppText
                style={
                  styles.sectionSubtitle
                }
              >
                Watch step-by-step guides
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() =>
              handleReadMore(
                'https://www.freshsweeper.com/help/videos',
                'Video Tutorials'
              )
            }
          >
            <LinearGradient
              colors={
                theme.hero?.background
                  ? [
                      theme.brand.primary,
                      theme.brand.secondary,
                    ]
                  : [
                      theme.brand.primary,
                      theme.brand.secondary,
                    ]
              }
              style={
                styles.videoGradient
              }
            >
              <MaterialCommunityIcons
                name="youtube"
                size={32}
                color={
                  theme.text.inverse
                }
              />

              <View
                style={
                  styles.videoTextContainer
                }
              >
                <AppText
                  style={
                    styles.videoTitle
                  }
                >
                  Watch Video Tutorials
                </AppText>

                <AppText
                  style={
                    styles.videoSubtitle
                  }
                >
                  Learn visually with our HD
                  video guides
                </AppText>
              </View>

              <Ionicons
                name="play-circle"
                size={40}
                color={
                  theme.text.inverse
                }
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Premium Support */}
        <LinearGradient
          colors={[
            theme.brand.primary,
            theme.brand.secondary,
          ]}
          style={
            styles.premiumBanner
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View
            style={
              styles.premiumContent
            }
          >
            <MaterialCommunityIcons
              name="crown"
              size={40}
              color="#FFD700"
            />

            <View
              style={styles.premiumText}
            >
              <AppText
                style={
                  styles.premiumTitle
                }
              >
                {tSafe(
                  'premium_title',
                  'Premium Host Support'
                )}
              </AppText>

              <AppText
                style={
                  styles.premiumSubtitle
                }
              >
                {tSafe(
                  'premium_subtitle',
                  '24/7 priority access • Dedicated account manager • Faster response times'
                )}
              </AppText>
            </View>

            <TouchableOpacity
              style={
                styles.premiumButton
              }
              onPress={() =>
                handleReadMore(
                  'https://help.freshsweeper.com/hosts/premium',
                  'Premium Support'
                )
              }
            >
              <AppText
                style={
                  styles.premiumButtonText
                }
              >
                {tSafe(
                  'premium_button',
                  'Learn More'
                )}
              </AppText>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={
                  theme.text.inverse
                }
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Version */}
        <View
          style={styles.versionInfo}
        >
          <AppText
            style={styles.versionText}
          >
            FreshSweeper for Hosts v3.2.1
          </AppText>

          <TouchableOpacity
            onPress={() =>
              handleReadMore(
                'https://help.freshsweeper.com/hosts/whats-new',
                "What's New"
              )
            }
          >
            <AppText
              style={
                styles.whatsNewLink
              }
            >
              What's new?
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Emergency FAB */}
      <FAB
        style={styles.fab}
        icon="phone"
        color={theme.text.inverse}
        onPress={() =>
          Linking.openURL(
            'tel:+19733804757'
          )
        }
        label={tSafe(
          'emergency_fab_label',
          'Emergency Call'
        )}
      />

      {/* Article WebView */}
      <WebHelpModal
        visible={webViewVisible}
        url={currentArticle.url}
        title={currentArticle.title}
        onClose={() =>
          setWebViewVisible(false)
        }
      />

      {/* Help Center WebView */}
      <WebHelpModal
        visible={showHelpCenter}
        url="https://help.freshsweeper.com/hosts"
        title="Help Center"
        onClose={() =>
          setShowHelpCenter(false)
        }
      />
    </View>
  );
};

// =========================================================
// Styles
// =========================================================

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    // =====================================================
    // Header
    // =====================================================

    header: {
      paddingTop:
        Platform.OS === 'ios'
          ? 50
          : 20,
      paddingBottom: 30,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },

    headerAppbar: {
      backgroundColor:
        'transparent',
      elevation: 0,
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text.inverse,
    },

    headerSubtitle: {
      fontSize: 14,
      color: withAlpha(
        theme.text.inverse,
        'CC'
      ),
      marginTop: 2,
    },

    headerContent: {
      paddingHorizontal: 20,
    },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.input.background,
      borderColor:
        theme.input.border,
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginTop: 10,
    },

    searchIcon: {
      marginRight: 10,
    },

    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.input.text,
      paddingVertical: 2,
    },

    // =====================================================
    // Content
    // =====================================================

    content: {
      flex: 1,
    },

    contentContainer: {
      padding: 20,
      paddingBottom: 100,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
    },

    sectionSubtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 4,
    },

    // =====================================================
    // Quick Actions
    // =====================================================

    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
      marginBottom: 30,
    },

    quickActionCard: {
      width: '48%',
      backgroundColor:
        theme.card.background,
      borderColor:
        theme.card.border,
      borderWidth: 1,
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      alignItems: 'center',
      position: 'relative',

      ...Platform.select({
        ios: {
          shadowColor:
            theme.shadow?.color ||
            '#000000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity:
            theme.shadow?.opacity ??
            0.1,
          shadowRadius: 8,
        },

        android: {
          elevation: 3,
        },
      }),
    },

    quickActionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    quickActionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      textAlign: 'center',
    },

    helpIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
    },

    // =====================================================
    // Contact
    // =====================================================

    contactSection: {
      marginBottom: 30,
    },

    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
    },

    contactCard: {
      width: '48%',
      backgroundColor:
        theme.card.background,
      borderColor:
        theme.card.border,
      borderWidth: 1,
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      alignItems: 'center',

      ...Platform.select({
        ios: {
          shadowColor:
            theme.shadow?.color ||
            '#000000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity:
            theme.shadow?.opacity ??
            0.1,
          shadowRadius: 8,
        },

        android: {
          elevation: 3,
        },
      }),
    },

    contactGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      position: 'relative',
    },

    badge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#FFD700',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },

    badgeText: {
      fontSize: 8,
      fontWeight: '700',
      color: '#1A1A1A',
    },

    contactTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      textAlign: 'center',
      marginBottom: 5,
    },

    contactSubtitle: {
      fontSize: 12,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    detailLink: {
      marginTop: 8,
    },

    detailLinkText: {
      fontSize: 11,
      color: theme.brand.primary,
      fontWeight: '600',
    },

    // =====================================================
    // Categories
    // =====================================================

    categoryScroll: {
      marginHorizontal: -20,
    },

    categoryContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },

    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.surface.default,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      marginRight: 10,
      borderWidth: 1,
      borderColor:
        theme.border.default,
    },

    categoryButtonActive: {
      backgroundColor:
        theme.brand.primary,
      borderColor:
        theme.brand.primary,
    },

    categoryIcon: {
      marginRight: 6,
    },

    categoryLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text.primary,
    },

    categoryLabelActive: {
      color: theme.text.inverse,
    },

    // =====================================================
    // FAQ
    // =====================================================

    faqSection: {
      marginTop: 20,
    },

    faqCard: {
      backgroundColor:
        theme.card.background,
      borderColor:
        theme.card.border,
      borderWidth: 1,
      borderRadius: 15,
      marginBottom: 12,
      padding: 16,
      overflow: 'hidden',

      ...Platform.select({
        ios: {
          shadowColor:
            theme.shadow?.color ||
            '#000000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity:
            theme.shadow?.opacity ??
            0.1,
          shadowRadius: 8,
        },

        android: {
          elevation: 2,
        },
      }),
    },

    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    faqIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    faqContent: {
      flex: 1,
    },

    faqHeaderTop: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },

    categoryChip: {
      height: 34,
      backgroundColor:
        'transparent',
    },

    faqQuestion: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      lineHeight: 22,
    },

    faqAnswerContainer: {
      marginTop: 10,
    },

    faqDivider: {
      marginVertical: 12,
      backgroundColor:
        theme.divider,
    },

    answerContent: {
      flexDirection: 'row',
    },

    answerIcon: {
      marginRight: 10,
      marginTop: 2,
    },

    faqAnswer: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 20,
      flex: 1,
    },

    readMoreButton: {
      marginTop: 12,
    },

    readMoreGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      borderRadius: 10,
      gap: 8,
    },

    readMoreText: {
      color: theme.brand.primary,
      fontSize: 13,
      fontWeight: '600',
    },

    feedbackContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        theme.divider,
    },

    feedbackLabel: {
      fontSize: 12,
      color: theme.text.muted,
    },

    feedbackButtons: {
      flexDirection: 'row',
      gap: 15,
    },

    feedbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    feedbackText: {
      fontSize: 12,
      color: theme.text.secondary,
    },

    // =====================================================
    // No Results
    // =====================================================

    noResultsCard: {
      backgroundColor:
        theme.card.background,
      borderColor:
        theme.card.border,
      borderWidth: 1,
      borderRadius: 15,
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },

    noResultsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      marginTop: 15,
      marginBottom: 5,
    },

    noResultsText: {
      fontSize: 14,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    viewAllButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor:
        withAlpha(
          theme.brand.primary,
          '10'
        ),
      borderRadius: 20,
    },

    viewAllButtonText: {
      color: theme.brand.primary,
      fontWeight: '600',
    },

    // =====================================================
    // Video
    // =====================================================

    videoSection: {
      marginTop: 30,
    },

    videoCard: {
      borderRadius: 15,
      overflow: 'hidden',
    },

    videoGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 15,
    },

    videoTextContainer: {
      flex: 1,
    },

    videoTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.inverse,
    },

    videoSubtitle: {
      fontSize: 12,
      color: withAlpha(
        theme.text.inverse,
        'CC'
      ),
      marginTop: 2,
    },

    // =====================================================
    // Premium Banner
    // =====================================================

    premiumBanner: {
      borderRadius: 20,
      padding: 20,
      marginTop: 30,
    },

    premiumContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    premiumText: {
      flex: 1,
      marginLeft: 15,
    },

    premiumTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.inverse,
      marginBottom: 5,
    },

    premiumSubtitle: {
      fontSize: 12,
      color: withAlpha(
        theme.text.inverse,
        'CC'
      ),
      lineHeight: 16,
    },

    premiumButton: {
      backgroundColor:
        'rgba(255,255,255,0.2)',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    premiumButtonText: {
      color: theme.text.inverse,
      fontSize: 14,
      fontWeight: '600',
    },

    // =====================================================
    // Version
    // =====================================================

    versionInfo: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 20,
    },

    versionText: {
      fontSize: 12,
      color: theme.text.muted,
    },

    whatsNewLink: {
      fontSize: 12,
      color: theme.brand.primary,
      marginTop: 5,
    },

    // =====================================================
    // FAB
    // =====================================================

    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor:
        theme.status.error,
    },

    // =====================================================
    // WebView
    // =====================================================

    webviewContainer: {
      flex: 1,
      backgroundColor:
        theme.background.default,
    },

    webviewHeader: {
      backgroundColor:
        theme.surface.default,
      elevation: 4,

      shadowColor:
        theme.shadow?.color ||
        '#000000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        theme.shadow?.opacity ??
        0.1,

      shadowRadius: 4,
    },

    webviewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
    },

    webview: {
      flex: 1,
    },

    webviewLoader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
      zIndex: 10,
    },

    loadingText: {
      marginTop: 10,
      color: theme.text.secondary,
    },

    webviewError: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        theme.background.default,
      zIndex: 10,
    },

    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
      marginTop: 15,
    },

    errorText: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 5,
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor:
        theme.brand.primary,
      borderRadius: 10,
    },

    retryText: {
      color: theme.text.inverse,
      fontWeight: '600',
    },
  });

export default HostSupport;

// import React, { useMemo, useState } from 'react';
// import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Linking } from 'react-native';
// import { Appbar, Text, Surface, Chip, FAB } from 'react-native-paper';
// import { LinearGradient } from 'expo-linear-gradient';
// import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// import COLORS from '../../constants/colors';
// import ROUTES from '../../constants/routes';

// const Card = ({children, style}) => <Surface elevation={2} style={[styles.card, style]}>{children}</Surface>;

// export default function HostSupport({ navigation }) {
//   const [query,setQuery]=useState('');
//   const [category,setCategory]=useState('all');
//   const quick = [
//     ['Cleaner No Show','alert-circle',COLORS.error,'ReportIssue'],
//     ['Modify Booking','calendar-edit',COLORS.primary,'ModifySchedule'],
//     ['Payment Help','credit-card-refresh',COLORS.success,'PaymentSupport'],
//     ['Property Issue','home-alert',COLORS.warning,'PropertyIssue']
//   ];
//   const faqs=[
//     {q:'How do I create a cleaning schedule?',a:'Dashboard → Properties → Select property → Create Schedule.',c:'scheduling'},
//     {q:'How do refunds work?',a:'Eligible refunds are automatically processed to the original payment method.',c:'payment'},
//     {q:'Cleaner cancelled last minute?',a:'We immediately search for a replacement or issue credit/refund options.',c:'cleaners'},
//     {q:'How do I update access instructions?',a:'Open property details and edit check-in / entry notes.',c:'property'}
//   ];
//   const filtered = useMemo(()=>faqs.filter(x => (category==='all'||x.c===category) && (x.q+x.a).toLowerCase().includes(query.toLowerCase())),[query,category]);

//   return <View style={styles.container}>
//     <LinearGradient colors={[COLORS.primary,'#4F46E5']} style={styles.hero}>
//       <Appbar.Header style={styles.appbar}>
//         <Appbar.BackAction color='white' onPress={()=>navigation.goBack()} />
//         <Appbar.Content title={<Text style={styles.heroTitle}>Host Success Center</Text>} />
//         <Appbar.Action icon='bell-outline' color='white' onPress={()=>navigation.navigate(ROUTES.notification)} />
//       </Appbar.Header>
//       <Text style={styles.heroSub}>How can we help today?</Text>
//       <View style={styles.searchWrap}>
//         <Ionicons name='search' size={18} color={COLORS.gray} />
//         <TextInput value={query} onChangeText={setQuery} placeholder='Search bookings, payments, cleaners...' style={styles.input} />
//       </View>
//     </LinearGradient>

//     <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//       <Text style={styles.section}>Urgent Actions</Text>
//       <View style={styles.grid}>{quick.map((x,i)=><TouchableOpacity key={i} style={styles.gridItem} onPress={()=>navigation.navigate(x[3])}><Card><View style={[styles.iconBubble,{backgroundColor:x[2]+'22'}]}><MaterialCommunityIcons name={x[1]} size={24} color={x[2]} /></View><Text style={styles.cardTitle}>{x[0]}</Text></Card></TouchableOpacity>)}</View>

//       <Text style={styles.section}>Today's Support</Text>
//       <Card style={styles.bookingCard}><Text style={styles.cardTitle}>Cleaner arriving today at 2:00 PM</Text><Text style={styles.muted}>Need help before arrival?</Text><View style={styles.row}><Chip onPress={()=>{}}>Track</Chip><Chip onPress={()=>{}}>Update Access</Chip><Chip onPress={()=>{}}>Message</Chip></View></Card>

//       <Text style={styles.section}>Contact Options</Text>
//       <View style={styles.grid}>
//         {[
//           ['Live Chat','message-text',COLORS.primary],['Call Support','phone',COLORS.success],['Email Team','email-fast',COLORS.warning],['Dedicated Manager','crown','#7C3AED']
//         ].map((x,i)=><TouchableOpacity key={i} style={styles.gridItem} onPress={()=> x[0]==='Call Support'?Linking.openURL('tel:+18001234567'):null}><Card><View style={[styles.iconBubble,{backgroundColor:x[2]+'22'}]}><MaterialCommunityIcons name={x[1]} size={24} color={x[2]} /></View><Text style={styles.cardTitle}>{x[0]}</Text></Card></TouchableOpacity>)}
//       </View>

//       <Text style={styles.section}>Help Topics</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
//         {['all','scheduling','payment','cleaners','property'].map(x=><Chip key={x} selected={category===x} onPress={()=>setCategory(x)} style={styles.chip}>{x}</Chip>)}
//       </ScrollView>
//       {filtered.map((f,i)=><Card key={i} style={{marginBottom:12}}><Text style={styles.cardTitle}>{f.q}</Text><Text style={styles.muted}>{f.a}</Text><TouchableOpacity><Text style={styles.link}>Read Full Guide →</Text></TouchableOpacity></Card>)}

//       <LinearGradient colors={['#7C3AED','#2563EB']} style={styles.banner}><Text style={styles.bannerTitle}>Premium Host Concierge</Text><Text style={styles.bannerText}>Priority response times • Faster replacements • Dedicated manager</Text></LinearGradient>
//     </ScrollView>

//     <FAB style={styles.fab} icon='phone' label='Emergency' color='white' onPress={()=>Linking.openURL('tel:+19733804757')} />
//   </View>
// }

// const styles=StyleSheet.create({
// container:{flex:1,backgroundColor:'#F8FAFC'},hero:{paddingTop:Platform.OS==='ios'?48:20,paddingBottom:24,borderBottomLeftRadius:28,borderBottomRightRadius:28},appbar:{backgroundColor:'transparent',elevation:0},heroTitle:{color:'white',fontSize:22,fontWeight:'800'},heroSub:{color:'rgba(255,255,255,.9)',fontSize:16,paddingHorizontal:20,marginTop:4},searchWrap:{margin:20,marginBottom:0,backgroundColor:'white',borderRadius:18,paddingHorizontal:14,flexDirection:'row',alignItems:'center'},input:{flex:1,padding:12},content:{padding:18,paddingBottom:100},section:{fontSize:18,fontWeight:'800',marginBottom:12,color:'#0F172A'},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},gridItem:{width:'48%',marginBottom:12},card:{padding:16,borderRadius:22,backgroundColor:'white'},iconBubble:{width:48,height:48,borderRadius:16,alignItems:'center',justifyContent:'center',marginBottom:10},cardTitle:{fontSize:14,fontWeight:'700',color:'#0F172A'},muted:{marginTop:6,color:'#64748B',lineHeight:20},row:{flexDirection:'row',gap:8,marginTop:12,flexWrap:'wrap'},chip:{marginRight:8},link:{marginTop:10,color:'#2563EB',fontWeight:'700'},banner:{padding:18,borderRadius:24,marginTop:18},bannerTitle:{color:'white',fontSize:18,fontWeight:'800'},bannerText:{color:'rgba(255,255,255,.9)',marginTop:6},fab:{position:'absolute',right:20,bottom:20,backgroundColor:'#EF4444'}});