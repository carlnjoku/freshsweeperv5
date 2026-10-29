

import React, {
  useRef,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
  LayoutAnimation,
  UIManager,
} from "react-native";

import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";

import {
  useTheme,
} from "../../theme";

import AppText from "../../ui/AppText";
import AppCard from "../../ui/AppCard";
import AppButton from "../../ui/AppButton";

import { tSafe } from "../../utils/tSafe";

/* -------------------------------------------------------------------------- */
/* ANDROID LAYOUT ANIMATION                                                   */
/* -------------------------------------------------------------------------- */

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(
    true
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const withAlpha = (
  color,
  alpha,
  fallback
) => {
  if (
    typeof color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(color)
  ) {
    return `${color}${alpha}`;
  }

  return fallback || color;
};

/* -------------------------------------------------------------------------- */
/* FAQ ITEM                                                                   */
/* -------------------------------------------------------------------------- */

const FAQItem = ({
  question,
  answer,
  icon,
  theme,
}) => {
  const [expanded, setExpanded] =
    useState(false);

  const animation = useRef(
    new Animated.Value(0)
  ).current;

  const contentHeight = useRef(0);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    );

    const nextExpanded =
      !expanded;

    setExpanded(nextExpanded);

    Animated.timing(animation, {
      toValue: nextExpanded ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "0deg",
        "180deg",
      ],
    });

  return (
    <AppCard
      variant="bordered"
      style={[
        styles.faqCard,
        {
          backgroundColor:
            theme.card.background,
          borderColor:
            expanded
              ? theme.border.focus
              : theme.card.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={
          toggleAccordion
        }
        accessibilityRole="button"
        accessibilityState={{
          expanded,
        }}
      >
        <View
          style={styles.faqHeader}
        >
          <View
            style={[
              styles.faqIconContainer,
              {
                backgroundColor:
                  expanded
                    ? withAlpha(
                        theme.brand.primary,
                        "18",
                        theme.surface.selected
                      )
                    : theme.surface.selected,
                borderColor:
                  expanded
                    ? withAlpha(
                        theme.brand.primary,
                        "35",
                        theme.border.default
                      )
                    : theme.border.default,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={21}
              color={
                expanded
                  ? theme.brand.primary
                  : theme.icon.default
              }
            />
          </View>

          <View
            style={
              styles.faqQuestionContainer
            }
          >
            <AppText
              variant="body"
              style={[
                styles.faqQuestion,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              {question}
            </AppText>
          </View>

          <Animated.View
            style={{
              transform: [
                {
                  rotate:
                    rotateInterpolate,
                },
              ],
            }}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={23}
              color={
                expanded
                  ? theme.brand.primary
                  : theme.icon.muted
              }
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={[
            styles.faqAnswerContainer,
            {
              borderTopColor:
                theme.divider,
            },
          ]}
        >
          <AppText
            variant="body"
            style={[
              styles.faqAnswer,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {answer}
          </AppText>
        </View>
      )}
    </AppCard>
  );
};

/* -------------------------------------------------------------------------- */
/* CONTACT METHOD                                                             */
/* -------------------------------------------------------------------------- */

const ContactMethodCard = ({
  method,
  theme,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={method.action}
      style={[
        styles.contactCard,
        {
          backgroundColor:
            theme.card.background,
          borderColor:
            theme.card.border,
        },
      ]}
    >
      <View
        style={[
          styles.contactIcon,
          {
            backgroundColor:
              withAlpha(
                method.color,
                "18",
                theme.surface.selected
              ),
            borderColor:
              withAlpha(
                method.color,
                "35",
                theme.border.default
              ),
          },
        ]}
      >
        <MaterialCommunityIcons
          name={method.icon}
          size={25}
          color={method.color}
        />
      </View>

      <AppText
        variant="subtitle"
        style={[
          styles.contactTitle,
          {
            color:
              theme.text.primary,
          },
        ]}
      >
        {method.title}
      </AppText>

      <AppText
        variant="caption"
        style={[
          styles.contactSubtitle,
          {
            color:
              theme.text.muted,
          },
        ]}
      >
        {method.subtitle}
      </AppText>

      <View
        style={styles.contactAction}
      >
        <AppText
          variant="caption"
          style={[
            styles.contactActionText,
            {
              color:
                method.color,
            },
          ]}
        >
          {tSafe(
            "contact_now",
            "Contact"
          )}
        </AppText>

        <MaterialCommunityIcons
          name="arrow-top-right"
          size={15}
          color={method.color}
        />
      </View>
    </TouchableOpacity>
  );
};

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

const EmptySearchState = ({
  searchQuery,
  onClear,
  theme,
}) => {
  return (
    <AppCard
      variant="bordered"
      style={[
        styles.emptyCard,
        {
          backgroundColor:
            theme.card.background,
          borderColor:
            theme.card.border,
        },
      ]}
    >
      <View
        style={[
          styles.emptyIcon,
          {
            backgroundColor:
              theme.surface.selected,
            borderColor:
              theme.border.default,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={32}
          color={theme.icon.muted}
        />
      </View>

      <AppText
        variant="h3"
        style={[
          styles.emptyTitle,
          {
            color:
              theme.text.primary,
          },
        ]}
      >
        {tSafe(
          "no_results_title",
          "No matches found"
        )}
      </AppText>

      <AppText
        variant="body"
        style={[
          styles.emptyText,
          {
            color:
              theme.text.secondary,
          },
        ]}
      >
        {searchQuery
          ? `${tSafe(
              "no_results_message",
              "Try different keywords or browse our FAQ categories."
            )}`
          : tSafe(
              "no_results_message",
              "Try different keywords or browse our FAQ categories."
            )}
      </AppText>

      {!!searchQuery && (
        <AppButton
          variant="secondary"
          onPress={onClear}
          style={styles.clearSearchButton}
        >
          {tSafe(
            "clear_search",
            "Clear Search"
          )}
        </AppButton>
      )}
    </AppCard>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const Support = ({
  navigation,
}) => {
  const { theme } =
    useTheme();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const faqData = [
    {
      id: 1,
      question: tSafe(
        "faq_q1",
        "How do I create a cleaning schedule?"
      ),
      answer: tSafe(
        "faq_a1",
        "Go to your dashboard, select a property, and tap 'Create Schedule'. Fill out the necessary details like date, time, and cleaning requirements, then submit to publish your schedule."
      ),
      icon: "calendar-plus",
    },
    {
      id: 2,
      question: tSafe(
        "faq_q2",
        "Can I select a preferred cleaner?"
      ),
      answer: tSafe(
        "faq_a2",
        "Absolutely! After setting up a schedule, browse through nearby available cleaners, view their ratings and reviews, then send a personalized request to your preferred choice."
      ),
      icon: "account-check",
    },
    {
      id: 3,
      question: tSafe(
        "faq_q3",
        "How do cleaners accept or decline tasks?"
      ),
      answer: tSafe(
        "faq_a3",
        "Cleaners receive instant notifications for new requests. They can view complete task details including location, time, and payment before accepting or declining within the app."
      ),
      icon: "check-decagram",
    },
    {
      id: 4,
      question: tSafe(
        "faq_q4",
        "How can I reset my password?"
      ),
      answer: tSafe(
        "faq_a4",
        "Navigate to Profile → Security Settings → Change Password. Follow the verification steps to securely reset your credentials."
      ),
      icon: "lock-reset",
    },
    {
      id: 5,
      question: tSafe(
        "faq_q5",
        "How do I update my property details?"
      ),
      answer: tSafe(
        "faq_a5",
        "Visit the 'Properties' section, select the property, tap 'Edit' to update room details, address, special instructions, or upload new photos."
      ),
      icon: "home-edit",
    },
    {
      id: 6,
      question: tSafe(
        "faq_q6",
        "What if a cleaner doesn't show up?"
      ),
      answer: tSafe(
        "faq_a6",
        "Immediately report through the schedule details. We'll initiate our backup protocol to find a replacement or process a full refund."
      ),
      icon: "account-alert",
    },
    {
      id: 7,
      question: tSafe(
        "faq_q7",
        "How can I view before/after photos?"
      ),
      answer: tSafe(
        "faq_a7",
        "After completion, go to Schedule History, select the task, and navigate to the 'Gallery' tab to view all uploaded photos."
      ),
      icon: "image-multiple",
    },
    {
      id: 8,
      question: tSafe(
        "faq_q8",
        "How do I get paid as a cleaner?"
      ),
      answer: tSafe(
        "faq_a8",
        "Earnings are automatically processed every Monday to your linked payment method. View your payment history in the Earnings section."
      ),
      icon: "cash",
    },
    {
      id: 9,
      question: tSafe(
        "faq_q9",
        "How do I report an issue?"
      ),
      answer: tSafe(
        "faq_a9",
        "Open the completed task, scroll to 'Report Issue', provide details with photos if needed. Our team will respond within 24 hours."
      ),
      icon: "alert-circle-outline",
    },
    {
      id: 10,
      question: tSafe(
        "faq_q10",
        "How do I contact support?"
      ),
      answer: tSafe(
        "faq_a10",
        "Use any contact method below. For urgent matters, call our hotline. Email responses typically within 2-4 business hours."
      ),
      icon: "help-circle-outline",
    },
  ];

  const filteredFAQs =
    faqData.filter(
      (item) =>
        item.question
          .toLowerCase()
          .includes(
            searchQuery
              .toLowerCase()
          ) ||
        item.answer
          .toLowerCase()
          .includes(
            searchQuery
              .toLowerCase()
          )
    );

  const contactMethods = [
    {
      id: 1,
      title: tSafe(
        "contact_email_title",
        "Email Support"
      ),
      subtitle:
        "support@freshsweeper.com",
      icon: "email-outline",
      color:
        theme.brand.primary,
      action: () =>
        Linking.openURL(
          "mailto:support@freshsweeper.com"
        ),
    },
    {
      id: 2,
      title: tSafe(
        "contact_chat_title",
        "Live Chat"
      ),
      subtitle: tSafe(
        "contact_chat_subtitle",
        "Available 9AM-6PM EST"
      ),
      icon:
        "chat-processing-outline",
      color:
        theme.brand.secondary,
      action: () =>
        navigation.navigate(
          "LiveChat"
        ),
    },
    {
      id: 3,
      title: tSafe(
        "contact_phone_title",
        "Phone Support"
      ),
      subtitle:
        "+1 (800) 123-4567",
      icon: "phone-outline",
      color:
        theme.status.success,
      action: () =>
        Linking.openURL(
          "tel:+18001234567"
        ),
    },
    {
      id: 4,
      title: tSafe(
        "contact_help_center_title",
        "Help Center"
      ),
      subtitle: tSafe(
        "contact_help_center_subtitle",
        "Articles & Tutorials"
      ),
      icon:
        "book-open-outline",
      color:
        theme.status.info,
      action: () =>
        Linking.openURL(
          "https://www.freshsweeper.com/help/videos"
        ),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background.default,
        },
      ]}
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <View
        style={[
          styles.header,
          {
            backgroundColor:
              theme.hero.background,
            borderBottomColor:
              theme.border.default,
          },
        ]}
      >
        <View
          style={
            styles.headerTopRow
          }
        >
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              navigation.goBack()
            }
            style={[
              styles.backButton,
              {
                backgroundColor:
                  withAlpha(
                    theme.hero.foreground,
                    "14",
                    theme.surface.selected
                  ),
                borderColor:
                  withAlpha(
                    theme.hero.foreground,
                    "25",
                    theme.border.default
                  ),
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={
                theme.hero.foreground
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerTitleContainer
            }
          >
            <AppText
              variant="h1"
              style={[
                styles.headerTitle,
                {
                  color:
                    theme.hero.foreground,
                },
              ]}
            >
              {tSafe(
                "help_support_title",
                "Help & Support"
              )}
            </AppText>

            <AppText
              variant="caption"
              style={[
                styles.headerEyebrow,
                {
                  color:
                    theme.hero.mutedForeground,
                },
              ]}
            >
              {tSafe(
                "support_center",
                "FRESHSWEEPER SUPPORT CENTER"
              )}
            </AppText>
          </View>

          <View
            style={[
              styles.headerBadge,
              {
                backgroundColor:
                  withAlpha(
                    theme.hero.foreground,
                    "12",
                    theme.surface.selected
                  ),
                borderColor:
                  withAlpha(
                    theme.hero.foreground,
                    "25",
                    theme.border.default
                  ),
              },
            ]}
          >
            <MaterialCommunityIcons
              name="headset"
              size={21}
              color={
                theme.hero.foreground
              }
            />
          </View>
        </View>

        <AppText
          variant="body"
          style={[
            styles.headerSubtitle,
            {
              color:
                theme.hero.mutedForeground,
            },
          ]}
        >
          {tSafe(
            "help_support_subtitle",
            "How can we help you today?"
          )}
        </AppText>

        {/* SEARCH */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                theme.input.background,
              borderColor:
                theme.border.default,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={21}
            color={
              theme.icon.muted
            }
          />

          <TextInput
            style={[
              styles.searchInput,
              {
                color:
                  theme.input.text,
              },
            ]}
            placeholder={tSafe(
              "search_placeholder",
              "Search for answers..."
            )}
            placeholderTextColor={
              theme.input.placeholder
            }
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />

          {searchQuery.length >
            0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setSearchQuery("")
              }
              style={
                styles.clearButton
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={
                  theme.icon.muted
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ================================================================== */}
      {/* CONTENT                                                            */}
      {/* ================================================================== */}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.contentContainer,
          {
            backgroundColor:
              theme.background.default,
          },
        ]}
      >
        {/* ================================================================ */}
        {/* CONTACT                                                          */}
        {/* ================================================================ */}

        <View
          style={styles.sectionHeading}
        >
          <View>
            <AppText
              variant="h2"
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              {tSafe(
                "quick_contact",
                "Quick Contact"
              )}
            </AppText>

            <AppText
              variant="caption"
              style={[
                styles.sectionSubtitle,
                {
                  color:
                    theme.text.muted,
                },
              ]}
            >
              {tSafe(
                "contact_support_description",
                "Choose the support option that works best for you."
              )}
            </AppText>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.contactContainer
          }
        >
          {contactMethods.map(
            (method) => (
              <ContactMethodCard
                key={method.id}
                method={method}
                theme={theme}
              />
            )
          )}
        </ScrollView>

        {/* ================================================================ */}
        {/* FAQ                                                              */}
        {/* ================================================================ */}

        <View
          style={[
            styles.faqSection,
            {
              borderTopColor:
                theme.divider,
            },
          ]}
        >
          <View
            style={
              styles.faqSectionHeader
            }
          >
            <View
              style={
                styles.faqHeadingContent
              }
            >
              <AppText
                variant="h2"
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "faq_section_title",
                  "Frequently Asked Questions"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "faq_count",
                  "{count} questions found",
                  {
                    count:
                      filteredFAQs.length,
                  }
                )}
              </AppText>
            </View>

            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor:
                    theme.surface.selected,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.countBadgeText,
                  {
                    color:
                      theme.text.secondary,
                  },
                ]}
              >
                {filteredFAQs.length}
              </AppText>
            </View>
          </View>

          {filteredFAQs.length >
          0 ? (
            filteredFAQs.map(
              (item) => (
                <FAQItem
                  key={item.id}
                  question={
                    item.question
                  }
                  answer={
                    item.answer
                  }
                  icon={item.icon}
                  theme={theme}
                />
              )
            )
          ) : (
            <EmptySearchState
              searchQuery={
                searchQuery
              }
              onClear={() =>
                setSearchQuery("")
              }
              theme={theme}
            />
          )}
        </View>

        {/* ================================================================ */}
        {/* STILL NEED HELP                                                  */}
        {/* ================================================================ */}

        <AppCard
          variant="bordered"
          style={[
            styles.helpCard,
            {
              backgroundColor:
                theme.card.background,
              borderColor:
                theme.card.border,
            },
          ]}
        >
          <View
            style={
              styles.helpHeader
            }
          >
            <View
              style={[
                styles.helpIcon,
                {
                  backgroundColor:
                    theme.surface.selected,
                  borderColor:
                    theme.border.default,
                },
              ]}
            >
              <FontAwesome5
                name="hands-helping"
                size={22}
                color={
                  theme.brand.primary
                }
              />
            </View>

            <View
              style={
                styles.helpHeadingContent
              }
            >
              <AppText
                variant="h3"
                style={[
                  styles.helpTitle,
                  {
                    color:
                      theme.text.primary,
                  },
                ]}
              >
                {tSafe(
                  "still_need_help",
                  "Still need help?"
                )}
              </AppText>

              <AppText
                variant="caption"
                style={[
                  styles.helpSubtitle,
                  {
                    color:
                      theme.text.muted,
                  },
                ]}
              >
                {tSafe(
                  "support_team_available",
                  "Our support team is here for you."
                )}
              </AppText>
            </View>
          </View>

          <AppText
            variant="body"
            style={[
              styles.helpText,
              {
                color:
                  theme.text.secondary,
              },
            ]}
          >
            {tSafe(
              "help_text",
              "Our support team is available 7 days a week to assist you with any questions or concerns."
            )}
          </AppText>

          <AppButton
            variant="primary"
            onPress={() =>
              navigation.navigate(
                "ContactForm"
              )
            }
            icon="arrow-right"
            style={
              styles.helpButton
            }
          >
            {tSafe(
              "submit_request",
              "Submit a Request"
            )}
          </AppButton>
        </AppCard>

        {/* ================================================================ */}
        {/* EMERGENCY                                                        */}
        {/* ================================================================ */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            Linking.openURL(
              "tel:+19733804757"
            )
          }
          style={[
            styles.emergencyCard,
            {
              backgroundColor:
                withAlpha(
                  theme.status.error,
                  "0D",
                  theme.surface.selected
                ),
              borderColor:
                withAlpha(
                  theme.status.error,
                  "40",
                  theme.border.default
                ),
            },
          ]}
        >
          <View
            style={[
              styles.emergencyIcon,
              {
                backgroundColor:
                  withAlpha(
                    theme.status.error,
                    "18",
                    theme.surface.elevated
                  ),
              },
            ]}
          >
            <MaterialCommunityIcons
              name="phone-alert-outline"
              size={23}
              color={
                theme.status.error
              }
            />
          </View>

          <View
            style={
              styles.emergencyContent
            }
          >
            <AppText
              variant="subtitle"
              style={[
                styles.emergencyTitle,
                {
                  color:
                    theme.text.primary,
                },
              ]}
            >
              {tSafe(
                "emergency",
                "Emergency Support"
              )}
            </AppText>

            <AppText
              variant="caption"
              style={[
                styles.emergencySubtitle,
                {
                  color:
                    theme.text.secondary,
                },
              ]}
            >
              {tSafe(
                "emergency_support_description",
                "Call our emergency support line when immediate assistance is required."
              )}
            </AppText>
          </View>

          <View
            style={[
              styles.emergencyArrow,
              {
                backgroundColor:
                  theme.status.error,
              },
            ]}
          >
            <Ionicons
              name="call"
              size={17}
              color={
                theme.icon.inverse
              }
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ---------------------------------------------------------------------- */
  /* HEADER                                                                 */
  /* ---------------------------------------------------------------------- */

  header: {
    paddingTop:
      Platform.OS === "ios"
        ? 54
        : 24,
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerEyebrow: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },

  headerTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
  },

  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 17,
    marginBottom: 16,
  },

  searchContainer: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 15,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    fontSize: 15,
    paddingVertical: 0,
  },

  clearButton: {
    padding: 4,
  },

  /* ---------------------------------------------------------------------- */
  /* CONTENT                                                                */
  /* ---------------------------------------------------------------------- */

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 23,
    paddingBottom: 45,
  },

  sectionHeading: {
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  /* ---------------------------------------------------------------------- */
  /* CONTACT                                                                */
  /* ---------------------------------------------------------------------- */

  contactContainer: {
    paddingTop: 3,
    paddingBottom: 5,
    paddingRight: 4,
  },

  contactCard: {
    width: 158,
    minHeight: 184,
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    marginRight: 11,
  },

  contactIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  contactTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },

  contactSubtitle: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
    minHeight: 34,
  },

  contactAction: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
  },

  contactActionText: {
    fontSize: 11,
    fontWeight: "800",
    marginRight: 4,
  },

  /* ---------------------------------------------------------------------- */
  /* FAQ                                                                    */
  /* ---------------------------------------------------------------------- */

  faqSection: {
    marginTop: 29,
    paddingTop: 24,
    borderTopWidth: 1,
  },

  faqSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  faqHeadingContent: {
    flex: 1,
  },

  countBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  countBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },

  faqCard: {
    borderRadius: 18,
    marginBottom: 10,
    padding: 0,
    overflow: "hidden",
  },

  faqHeader: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  faqIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  faqQuestionContainer: {
    flex: 1,
    marginRight: 9,
  },

  faqQuestion: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  faqAnswerContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 17,
  },

  faqAnswer: {
    fontSize: 13,
    lineHeight: 21,
  },

  /* ---------------------------------------------------------------------- */
  /* EMPTY STATE                                                            */
  /* ---------------------------------------------------------------------- */

  emptyCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 300,
  },

  clearSearchButton: {
    marginTop: 17,
  },

  /* ---------------------------------------------------------------------- */
  /* HELP CARD                                                              */
  /* ---------------------------------------------------------------------- */

  helpCard: {
    borderRadius: 21,
    padding: 18,
    marginTop: 28,
  },

  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  helpHeadingContent: {
    flex: 1,
    marginLeft: 11,
  },

  helpTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  helpSubtitle: {
    marginTop: 2,
    fontSize: 11,
  },

  helpText: {
    fontSize: 13,
    lineHeight: 21,
    marginTop: 15,
    marginBottom: 17,
  },

  helpButton: {
    width: "100%",
  },

  /* ---------------------------------------------------------------------- */
  /* EMERGENCY                                                              */
  /* ---------------------------------------------------------------------- */

  emergencyCard: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 19,
    padding: 13,
    marginTop: 13,
  },

  emergencyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  emergencyContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  emergencyTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  emergencySubtitle: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  emergencyArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Support;