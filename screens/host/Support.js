import React, { useState, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
} from "react-native";
import {
  Appbar,
  Text,
  IconButton,
  Surface,
  Divider,
  FAB,
  Chip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../constants/colors";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { tSafe } from "../../utils/tSafe";

const HostFAQItem = ({ question, answer, icon, category, index }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const heightAnimation = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    if (expanded) {
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
    setExpanded(!expanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const scaleInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "scheduling": return COLORS.primary;
      case "payment": return COLORS.success;
      case "cleaner": return COLORS.warning;
      case "property": return COLORS.info;
      case "emergency": return COLORS.error;
      default: return COLORS.primary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleInterpolate }] }}>
      <Surface style={styles.faqCard} elevation={expanded ? 4 : 2}>
        <TouchableOpacity onPress={toggleAccordion} activeOpacity={0.7}>
          <View style={styles.faqHeader}>
            <View style={[
              styles.faqIconContainer,
              { backgroundColor: getCategoryColor(category) + '15' }
            ]}>
              <MaterialCommunityIcons
                name={icon}
                size={22}
                color={getCategoryColor(category)}
              />
            </View>
            <View style={styles.faqContent}>
              <View style={styles.faqHeaderTop}>
                <Chip 
                  mode="outlined" 
                  style={[
                    styles.categoryChip,
                    { borderColor: getCategoryColor(category) }
                  ]}
                  textStyle={{ color: getCategoryColor(category), fontSize: 10 }}
                >
                  {category.toUpperCase()}
                </Chip>
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <Ionicons
                    name="chevron-down"
                    size={24}
                    color={COLORS.darkGray}
                  />
                </Animated.View>
              </View>
              <Text style={styles.faqQuestion} numberOfLines={2}>
                {question}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {expanded && (
          <Animated.View 
            style={[
              styles.faqAnswerContainer,
              {
                opacity: animation,
                transform: [{
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }]
              }
            ]}
          >
            <Divider style={styles.faqDivider} />
            <View style={styles.answerContent}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={20}
                color={COLORS.warning}
                style={styles.answerIcon}
              />
              <Text style={styles.faqAnswer}>{answer}</Text>
            </View>
          </Animated.View>
        )}
      </Surface>
    </Animated.View>
  );
};

const HostSupport = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const hostFAQs = [
    {
      id: 1,
      question: tSafe("faq_host_create_schedule_q", "How do I create a cleaning schedule?"),
      answer: tSafe("faq_host_create_schedule_a", "Navigate to your Dashboard → Properties → Select a property → 'Create Schedule'. Set date, time, frequency, and special instructions. Review and confirm to publish."),
      icon: "calendar-plus",
      category: "scheduling",
    },
    {
      id: 2,
      question: tSafe("faq_host_select_cleaner_q", "Can I select a specific cleaner?"),
      answer: tSafe("faq_host_select_cleaner_a", "Yes! After creating a schedule, you'll see 'Choose Cleaner' option. Browse profiles, ratings, and reviews to select your preferred professional."),
      icon: "account-check",
      category: "cleaner",
    },
    {
      id: 3,
      question: tSafe("faq_host_payment_q", "How does payment work?"),
      answer: tSafe("faq_host_payment_a", "Payments are processed securely via Stripe. You'll be charged after cleaning completion. View receipts in Payment History. Cancelations within 24hrs are fully refunded."),
      icon: "credit-card-outline",
      category: "payment",
    },
    {
      id: 4,
      question: tSafe("faq_host_cancellation_cleaner_q", "What if my cleaner cancels last minute?"),
      answer: tSafe("faq_host_cancellation_cleaner_a", "We automatically notify backup cleaners. If no replacement found, you get 100% refund plus 20% off next booking. Contact support for immediate assistance."),
      icon: "account-alert",
      category: "emergency",
    },
    {
      id: 5,
      question: tSafe("faq_host_modify_booking_q", "How do I modify or cancel a booking?"),
      answer: tSafe("faq_host_modify_booking_a", "Go to Upcoming Schedules → Select booking → 'Modify' or 'Cancel'. Changes within 24hrs may incur fees. View cancellation policy in Terms."),
      icon: "calendar-edit",
      category: "scheduling",
    },
    {
      id: 6,
      question: tSafe("faq_host_special_instructions_q", "Can I add special instructions for cleaners?"),
      answer: tSafe("faq_host_special_instructions_a", "Absolutely. When creating/editing a schedule, use 'Special Instructions' field. Also add property-specific notes in Property Details section."),
      icon: "note-text-outline",
      category: "property",
    },
    {
      id: 7,
      question: tSafe("faq_host_review_cleaner_q", "How do I review my cleaner?"),
      answer: tSafe("faq_host_review_cleaner_a", "After cleaning completion, you'll receive a review prompt. Rate 1-5 stars and add comments. Reviews are anonymous to cleaners."),
      icon: "star-outline",
      category: "cleaner",
    },
    {
      id: 8,
      question: tSafe("faq_host_standard_cleaning_q", "What's included in standard cleaning?"),
      answer: tSafe("faq_host_standard_cleaning_a", "Dusting, vacuuming, mopping, bathroom sanitization, kitchen cleaning, trash removal. See Services menu for detailed checklist."),
      icon: "checkbox-marked-outline",
      category: "property",
    },
    {
      id: 9,
      question: tSafe("faq_host_report_damage_q", "How do I report damage or issues?"),
      answer: tSafe("faq_host_report_damage_a", "Within 24hrs of cleaning, go to Schedule Details → 'Report Issue' → Upload photos/description. Our team investigates within 48hrs."),
      icon: "alert-circle-outline",
      category: "emergency",
    },
    {
      id: 10,
      question: tSafe("faq_host_recurring_cleanings_q", "Can I schedule recurring cleanings?"),
      answer: tSafe("faq_host_recurring_cleanings_a", "Yes! Choose 'Recurring' when creating schedule. Set frequency (weekly, bi-weekly, monthly). Easily manage in Recurring Schedules tab."),
      icon: "repeat",
      category: "scheduling",
    },
    {
      id: 11,
      question: tSafe("faq_host_update_property_q", "How do I update my property details?"),
      answer: tSafe("faq_host_update_property_a", "Properties → Select property → 'Edit' → Update rooms, access instructions, parking info, or upload new photos."),
      icon: "home-edit",
      category: "property",
    },
    {
      id: 12,
      question: tSafe("faq_host_payment_methods_q", "What payment methods are accepted?"),
      answer: tSafe("faq_host_payment_methods_a", "All major credit/debit cards, Apple Pay, Google Pay. We don't store payment info - processed securely via Stripe."),
      icon: "wallet-outline",
      category: "payment",
    },
  ];

  const categories = [
    { id: "all", label: tSafe("category_all", "All Questions"), icon: "format-list-bulleted" },
    { id: "scheduling", label: tSafe("category_scheduling", "Scheduling"), icon: "calendar" },
    { id: "payment", label: tSafe("category_payment", "Payment"), icon: "credit-card" },
    { id: "cleaner", label: tSafe("category_cleaner", "Cleaners"), icon: "account-group" },
    { id: "property", label: tSafe("category_property", "Property"), icon: "home" },
    { id: "emergency", label: tSafe("category_emergency", "Emergency"), icon: "alert" },
  ];

  const filteredFAQs = hostFAQs.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const contactMethods = [
    {
      id: 1,
      title: tSafe("contact_priority_support", "Priority Support"),
      subtitle: tSafe("contact_priority_subtitle", "Host-dedicated line"),
      icon: "headset",
      color: COLORS.primary,
      action: () => Linking.openURL("tel:+18001234567"),
      badge: tSafe("badge_vip", "VIP"),
    },
    {
      id: 2,
      title: tSafe("contact_email_team", "Email Team"),
      subtitle: "hosts@freshsweeper.com",
      icon: "email-fast",
      color: COLORS.success,
      action: () => Linking.openURL("mailto:hosts@freshsweeper.com"),
    },
    {
      id: 3,
      title: tSafe("contact_live_chat", "Live Chat"),
      subtitle: tSafe("contact_live_chat_sub", "Instant response"),
      icon: "message-text",
      color: COLORS.warning,
      action: () => navigation.navigate("HostLiveChat"),
    },
    {
      id: 4,
      title: tSafe("contact_help_articles", "Help Articles"),
      subtitle: tSafe("contact_help_articles_sub", "Host guides & tips"),
      icon: "book-open-variant",
      color: COLORS.info,
      action: () => navigation.navigate("HostGuides"),
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: tSafe("quick_action_report_issue", "Report Issue"),
      icon: "alert-circle",
      color: COLORS.error,
      screen: "ReportIssue",
    },
    {
      id: 2,
      title: tSafe("quick_action_cancel_booking", "Cancel Booking"),
      icon: "calendar-remove",
      color: COLORS.warning,
      screen: "CancelBooking",
    },
    {
      id: 3,
      title: tSafe("quick_action_modify_schedule", "Modify Schedule"),
      icon: "calendar-edit",
      color: COLORS.info,
      screen: "ModifySchedule",
    },
    {
      id: 4,
      title: tSafe("quick_action_payment_help", "Payment Help"),
      icon: "credit-card-refresh",
      color: COLORS.success,
      screen: "PaymentSupport",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, "#4A6FA5"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Appbar.Header style={styles.headerAppbar}>
          <Appbar.BackAction
            color="white"
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content
            title={
              <View>
                <Text style={styles.headerTitle}>{tSafe("host_support_title", "Host Support")}</Text>
                <Text style={styles.headerSubtitle}>{tSafe("host_support_subtitle", "Premium assistance for hosts")}</Text>
              </View>
            }
          />
          <Appbar.Action 
            icon="bell-outline" 
            color="white" 
            onPress={() => navigation.navigate("Notifications")} 
          />
        </Appbar.Header>

        <View style={styles.headerContent}>
          {/* Search Bar */}
          <Surface style={styles.searchContainer} elevation={4}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.primary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={tSafe("search_placeholder", "Search help articles...")}
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.darkGray}
                />
              </TouchableOpacity>
            )}
          </Surface>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{tSafe("quick_actions_title", "Quick Actions")}</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.9}
            >
              <View style={[
                styles.quickActionIcon,
                { backgroundColor: action.color + '20' }
              ]}>
                <MaterialCommunityIcons
                  name={action.icon}
                  size={24}
                  color={action.color}
                />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Cards */}
        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{tSafe("contact_support_title", "Contact Support")}</Text>
            <Text style={styles.sectionSubtitle}>{tSafe("contact_support_subtitle", "Dedicated host team")}</Text>
          </View>
          <View style={styles.contactGrid}>
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.contactCard}
                onPress={method.action}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[method.color, method.color + 'DD']}
                  style={styles.contactGradient}
                >
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={24}
                    color="white"
                  />
                  {method.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{method.badge}</Text>
                    </View>
                  )}
                </LinearGradient>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(category.id)}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={16}
                color={activeCategory === category.id ? 'white' : COLORS.primary}
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryLabel,
                activeCategory === category.id && styles.categoryLabelActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{tSafe("faq_title", "Frequently Asked Questions")}</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredFAQs.length} {tSafe("questions_count", "questions")} • {activeCategory === 'all' ? tSafe("all_categories", "All categories") : activeCategory}
            </Text>
          </View>

          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <HostFAQItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                icon={item.icon}
                category={item.category}
                index={index}
              />
            ))
          ) : (
            <Surface style={styles.noResultsCard} elevation={2}>
              <MaterialCommunityIcons
                name="magnify-close"
                size={60}
                color={COLORS.lightGray}
              />
              <Text style={styles.noResultsTitle}>{tSafe("no_results_title", "No matches found")}</Text>
              <Text style={styles.noResultsText}>
                {tSafe("no_results_message", "Try different keywords or select another category")}
              </Text>
            </Surface>
          )}
        </View>

        {/* Premium Support Banner */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.premiumBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.premiumContent}>
            <MaterialCommunityIcons
              name="crown"
              size={40}
              color="gold"
            />
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>{tSafe("premium_title", "Premium Host Support")}</Text>
              <Text style={styles.premiumSubtitle}>
                {tSafe("premium_subtitle", "24/7 priority access • Dedicated account manager • Faster response times")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => navigation.navigate("PremiumSupport")}
            >
              <Text style={styles.premiumButtonText}>{tSafe("premium_button", "Upgrade")}</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Emergency FAB */}
      <FAB
        style={styles.fab}
        icon="phone"
        color="white"
        onPress={() => Linking.openURL("tel:+19733804757")}
        label={tSafe("emergency_fab_label", "Emergency Call")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerAppbar: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.dark,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    textAlign: "center",
  },
  contactSection: {
    marginBottom: 30,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  contactCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "gold",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: COLORS.dark,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    textAlign: "center",
    marginBottom: 5,
  },
  contactSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },
  categoryScroll: {
    marginHorizontal: -20,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.dark,
  },
  categoryLabelActive: {
    color: "white",
  },
  faqSection: {
    marginTop: 20,
  },
  faqCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 12,
    padding: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  faqContent: {
    flex: 1,
  },
  faqHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryChip: {
    height: 34,
    backgroundColor: "transparent",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    lineHeight: 22,
  },
  faqAnswerContainer: {
    marginTop: 10,
  },
  faqDivider: {
    marginVertical: 12,
    backgroundColor: COLORS.lightGray,
  },
  answerContent: {
    flexDirection: "row",
  },
  answerIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    flex: 1,
  },
  noResultsCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  premiumBanner: {
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  premiumText: {
    flex: 1,
    marginLeft: 15,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginBottom: 5,
  },
  premiumSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 16,
  },
  premiumButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  premiumButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 5,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.error,
  },
});

export default HostSupport;