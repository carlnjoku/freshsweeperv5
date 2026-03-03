// import React, { useState } from "react";
// import { ScrollView, StyleSheet, View } from "react-native";
// import { Appbar, List, Button, Text } from "react-native-paper";
// import COLORS from "../../constants/colors";

// const Support = () => {
//   const [expanded, setExpanded] = useState(false);

//   const handlePress = () => setExpanded(!expanded);

//   return (
//     <View style={styles.container}>
     
//       {/* Content */}
//       <ScrollView style={styles.content}>
//         <Text style={styles.title}>How can we help you?</Text>

//         {/* FAQ Section */}
//         <List.Section title="FAQs" style={styles.faqSection}>
//           <List.Accordion
//             title="How do I create a cleaning schedule?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="calendar-plus" color={COLORS.darkBlue} />}
//           >
//             <List.Item 
//               description="Go to your dashboard, select a property, and tap 'Create Schedule'. Fill out the necessary details and submit." 
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="Can I select a preferred cleaner?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="account-check" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Yes. After choosing a schedule, you can view available cleaners nearby and send a request to your preferred one." 
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="How do cleaners accept or decline a task?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="check-decagram" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Cleaners receive a notification for new requests. They can view task details and accept or decline within the app." 
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="How can I reset my password?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="lock-reset" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Go to your profile, select 'Change Password', and follow the prompts to reset your credentials."
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="How do I update my property details?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="home-edit" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Navigate to the 'Properties' tab, select a property, then tap 'Edit' to update room details, address, or notes."
//               descriptionNumberOfLines={10} 
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="What happens if a cleaner doesn’t show up?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="account-alert" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="You can contact support immediately. We’ll try to reassign a cleaner or issue a refund if necessary."
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="How can I view before and after photos?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="image-multiple" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Once a cleaning is completed, go to the schedule history and tap on the task to view all uploaded photos."
//               descriptionNumberOfLines={10} 
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="How do I get paid as a cleaner?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="cash" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Payouts are processed weekly via your linked payment method. Ensure your profile is up to date."
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>

//           <List.Accordion
//             title="How do I report an issue or incident?"
//             titleStyle={{ fontSize: 14, fontWeight: '400', color: COLORS.darkBlue }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="alert-circle-outline" color={COLORS.darkBlue}/>}
//           >
//             <List.Item 
//               description="Open the related task, scroll to the Incident tab, and submit a report with photos or notes." 
//               descriptionNumberOfLines={10}
//             />

//           </List.Accordion>

//           <List.Accordion
//             title="How do I contact support?"
//             titleStyle={{ fontSize: 14, fontWeight: '400' }}
//             style={{ backgroundColor: COLORS.primary_light_3, borderRadius: 8, marginBottom: 0 }}
//             left={(props) => <List.Icon {...props} icon="help-circle-outline" color={COLORS.darkBlue}/>}
//           >
//             <List.Item
//               title=""
//               description="Tap 'Contact Us' below to send us a message. You can also email us at support@freshsweeper.com." 
//               descriptionNumberOfLines={10}
//             />
//           </List.Accordion>
//         </List.Section>

//         {/* Contact Us Button */}
//         <Button
//           icon="email-outline"
//           mode="contained"
//           onPress={() => console.log("Contact support")}
//           style={styles.contactButton}
//         >
//           Contact Us
//         </Button>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   content: {
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   faqSection: {
//     marginBottom: 24,
//   },
//   contactButton: {
//     marginTop: 16,
//     backgroundColor:COLORS.primary
//   },
// });

// export default Support;





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
      question: "How do I create a cleaning schedule?",
      answer: "Navigate to your Dashboard → Properties → Select a property → 'Create Schedule'. Set date, time, frequency, and special instructions. Review and confirm to publish.",
      icon: "calendar-plus",
      category: "scheduling",
    },
    {
      id: 2,
      question: "Can I select a specific cleaner?",
      answer: "Yes! After creating a schedule, you'll see 'Choose Cleaner' option. Browse profiles, ratings, and reviews to select your preferred professional.",
      icon: "account-check",
      category: "cleaner",
    },
    {
      id: 3,
      question: "How does payment work?",
      answer: "Payments are processed securely via Stripe. You'll be charged after cleaning completion. View receipts in Payment History. Cancelations within 24hrs are fully refunded.",
      icon: "credit-card-outline",
      category: "payment",
    },
    {
      id: 4,
      question: "What if my cleaner cancels last minute?",
      answer: "We automatically notify backup cleaners. If no replacement found, you get 100% refund plus 20% off next booking. Contact support for immediate assistance.",
      icon: "account-alert",
      category: "emergency",
    },
    {
      id: 5,
      question: "How do I modify or cancel a booking?",
      answer: "Go to Upcoming Schedules → Select booking → 'Modify' or 'Cancel'. Changes within 24hrs may incur fees. View cancellation policy in Terms.",
      icon: "calendar-edit",
      category: "scheduling",
    },
    {
      id: 6,
      question: "Can I add special instructions for cleaners?",
      answer: "Absolutely. When creating/editing a schedule, use 'Special Instructions' field. Also add property-specific notes in Property Details section.",
      icon: "note-text-outline",
      category: "property",
    },
    {
      id: 7,
      question: "How do I review my cleaner?",
      answer: "After cleaning completion, you'll receive a review prompt. Rate 1-5 stars and add comments. Reviews are anonymous to cleaners.",
      icon: "star-outline",
      category: "cleaner",
    },
    {
      id: 8,
      question: "What's included in standard cleaning?",
      answer: "Dusting, vacuuming, mopping, bathroom sanitization, kitchen cleaning, trash removal. See Services menu for detailed checklist.",
      icon: "checkbox-marked-outline",
      category: "property",
    },
    {
      id: 9,
      question: "How do I report damage or issues?",
      answer: "Within 24hrs of cleaning, go to Schedule Details → 'Report Issue' → Upload photos/description. Our team investigates within 48hrs.",
      icon: "alert-circle-outline",
      category: "emergency",
    },
    {
      id: 10,
      question: "Can I schedule recurring cleanings?",
      answer: "Yes! Choose 'Recurring' when creating schedule. Set frequency (weekly, bi-weekly, monthly). Easily manage in Recurring Schedules tab.",
      icon: "repeat",
      category: "scheduling",
    },
    {
      id: 11,
      question: "How do I update my property details?",
      answer: "Properties → Select property → 'Edit' → Update rooms, access instructions, parking info, or upload new photos.",
      icon: "home-edit",
      category: "property",
    },
    {
      id: 12,
      question: "What payment methods are accepted?",
      answer: "All major credit/debit cards, Apple Pay, Google Pay. We don't store payment info - processed securely via Stripe.",
      icon: "wallet-outline",
      category: "payment",
    },
  ];

  const categories = [
    { id: "all", label: "All Questions", icon: "format-list-bulleted" },
    { id: "scheduling", label: "Scheduling", icon: "calendar" },
    { id: "payment", label: "Payment", icon: "credit-card" },
    { id: "cleaner", label: "Cleaners", icon: "account-group" },
    { id: "property", label: "Property", icon: "home" },
    { id: "emergency", label: "Emergency", icon: "alert" },
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
      title: "Priority Support",
      subtitle: "Host-dedicated line",
      icon: "headset",
      color: COLORS.primary,
      action: () => Linking.openURL("tel:+18001234567"),
      badge: "VIP",
    },
    {
      id: 2,
      title: "Email Team",
      subtitle: "hosts@freshsweeper.com",
      icon: "email-fast",
      color: COLORS.success,
      action: () => Linking.openURL("mailto:hosts@freshsweeper.com"),
    },
    {
      id: 3,
      title: "Live Chat",
      subtitle: "Instant response",
      icon: "message-text",
      color: COLORS.warning,
      action: () => navigation.navigate("HostLiveChat"),
    },
    {
      id: 4,
      title: "Help Articles",
      subtitle: "Host guides & tips",
      icon: "book-open-variant",
      color: COLORS.info,
      action: () => navigation.navigate("HostGuides"),
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Report Issue",
      icon: "alert-circle",
      color: COLORS.error,
      screen: "ReportIssue",
    },
    {
      id: 2,
      title: "Cancel Booking",
      icon: "calendar-remove",
      color: COLORS.warning,
      screen: "CancelBooking",
    },
    {
      id: 3,
      title: "Modify Schedule",
      icon: "calendar-edit",
      color: COLORS.info,
      screen: "ModifySchedule",
    },
    {
      id: 4,
      title: "Payment Help",
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
                <Text style={styles.headerTitle}>Host Support</Text>
                <Text style={styles.headerSubtitle}>Premium assistance for hosts</Text>
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
              placeholder="Search help articles..."
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
        <Text style={styles.sectionTitle}>Quick Actions</Text>
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
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.sectionSubtitle}>Dedicated host team</Text>
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
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredFAQs.length} questions • {activeCategory === 'all' ? 'All categories' : activeCategory}
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
              <Text style={styles.noResultsTitle}>No matches found</Text>
              <Text style={styles.noResultsText}>
                Try different keywords or select another category
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
              <Text style={styles.premiumTitle}>Premium Host Support</Text>
              <Text style={styles.premiumSubtitle}>
                24/7 priority access • Dedicated account manager • Faster response times
              </Text>
            </View>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => navigation.navigate("PremiumSupport")}
            >
              <Text style={styles.premiumButtonText}>Upgrade</Text>
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
        onPress={() => Linking.openURL("tel:+18001234567")}
        label="Emergency Call"
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