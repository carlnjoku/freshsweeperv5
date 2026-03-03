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
  TextInput
} from "react-native";
import {
  Appbar,
  Text,
  IconButton,
  Surface,
  Divider,
  FAB,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../constants/colors";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

const FAQItem = ({ question, answer, icon, index }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    if (expanded) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setExpanded(!expanded);
  };

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150], // Adjust based on content height
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Surface style={styles.faqCard} elevation={2}>
      <TouchableOpacity onPress={toggleAccordion} activeOpacity={0.7}>
        <View style={styles.faqHeader}>
          <View style={styles.faqIconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.faqQuestionContainer}>
            <Text style={styles.faqQuestion} numberOfLines={2}>
              {question}
            </Text>
          </View>
          <Animated.View
            style={{ transform: [{ rotate: rotateInterpolate }] }}
          >
            <Ionicons
              name="chevron-down"
              size={24}
              color={COLORS.darkGray}
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Animated.View style={{ height: heightInterpolate, overflow: "hidden" }}>
        <View style={styles.faqAnswerContainer}>
          <Divider style={styles.faqDivider} />
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      </Animated.View>
    </Surface>
  );
};

const Support = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    {
      id: 1,
      question: "How do I create a cleaning schedule?",
      answer: "Go to your dashboard, select a property, and tap 'Create Schedule'. Fill out the necessary details like date, time, and cleaning requirements, then submit to publish your schedule.",
      icon: "calendar-plus",
    },
    {
      id: 2,
      question: "Can I select a preferred cleaner?",
      answer: "Absolutely! After setting up a schedule, browse through nearby available cleaners, view their ratings and reviews, then send a personalized request to your preferred choice.",
      icon: "account-check",
    },
    {
      id: 3,
      question: "How do cleaners accept or decline tasks?",
      answer: "Cleaners receive instant notifications for new requests. They can view complete task details including location, time, and payment before accepting or declining within the app.",
      icon: "check-decagram",
    },
    {
      id: 4,
      question: "How can I reset my password?",
      answer: "Navigate to Profile → Security Settings → Change Password. Follow the verification steps to securely reset your credentials.",
      icon: "lock-reset",
    },
    {
      id: 5,
      question: "How do I update my property details?",
      answer: "Visit the 'Properties' section, select the property, tap 'Edit' to update room details, address, special instructions, or upload new photos.",
      icon: "home-edit",
    },
    {
      id: 6,
      question: "What if a cleaner doesn't show up?",
      answer: "Immediately report through the schedule details. We'll initiate our backup protocol to find a replacement or process a full refund.",
      icon: "account-alert",
    },
    {
      id: 7,
      question: "How can I view before/after photos?",
      answer: "After completion, go to Schedule History, select the task, and navigate to the 'Gallery' tab to view all uploaded photos.",
      icon: "image-multiple",
    },
    {
      id: 8,
      question: "How do I get paid as a cleaner?",
      answer: "Earnings are automatically processed every Monday to your linked payment method. View your payment history in the Earnings section.",
      icon: "cash",
    },
    {
      id: 9,
      question: "How do I report an issue?",
      answer: "Open the completed task, scroll to 'Report Issue', provide details with photos if needed. Our team will respond within 24 hours.",
      icon: "alert-circle-outline",
    },
    {
      id: 10,
      question: "How do I contact support?",
      answer: "Use any contact method below. For urgent matters, call our hotline. Email responses typically within 2-4 business hours.",
      icon: "help-circle-outline",
    },
  ];

  const filteredFAQs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactMethods = [
    {
      id: 1,
      title: "Email Support",
      subtitle: "support@freshsweeper.com",
      icon: "email-outline",
      color: COLORS.primary,
      action: () => Linking.openURL("mailto:support@freshsweeper.com"),
    },
    {
      id: 2,
      title: "Live Chat",
      subtitle: "Available 9AM-6PM EST",
      icon: "chat-processing-outline",
      color: COLORS.secondary,
      action: () => navigation.navigate("LiveChat"),
    },
    {
      id: 3,
      title: "Phone Support",
      subtitle: "+1 (800) 123-4567",
      icon: "phone-outline",
      color: COLORS.success,
      action: () => Linking.openURL("tel:+18001234567"),
    },
    {
      id: 4,
      title: "Help Center",
      subtitle: "Articles & Tutorials",
      icon: "book-open-outline",
      color: COLORS.warning,
      action: () => Linking.openURL("https://help.freshsweeper.com"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <Appbar.Header style={styles.headerAppbar}>
          <Appbar.BackAction
            color="white"
            onPress={() => navigation.goBack()}
          />
          <Appbar.Content
            title="Help & Support"
            titleStyle={styles.headerTitle}
          />
        </Appbar.Header>

        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>
            How can we help you today?
          </Text>
          
          {/* Search Bar */}
          <Surface style={styles.searchContainer} elevation={2}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.darkGray}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for answers..."
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
        {/* Contact Cards */}
        <Text style={styles.sectionTitle}>Quick Contact</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.contactScroll}
          contentContainerStyle={styles.contactContainer}
        >
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactCard}
              onPress={method.action}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[method.color, `${method.color}DD`]}
                style={styles.contactGradient}
              >
                <MaterialCommunityIcons
                  name={method.icon}
                  size={28}
                  color="white"
                />
              </LinearGradient>
              <Text style={styles.contactTitle}>{method.title}</Text>
              <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredFAQs.length} questions found
            </Text>
          </View>

          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <FAQItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                icon={item.icon}
                index={index}
              />
            ))
          ) : (
            <Surface style={styles.noResultsCard} elevation={2}>
              <Ionicons
                name="search-off"
                size={60}
                color={COLORS.lightGray}
              />
              <Text style={styles.noResultsTitle}>No matches found</Text>
              <Text style={styles.noResultsText}>
                Try different keywords or browse our FAQ categories
              </Text>
            </Surface>
          )}
        </View>

        {/* Additional Help Section */}
        <Surface style={styles.helpCard} elevation={2}>
          <View style={styles.helpHeader}>
            <FontAwesome5
              name="hands-helping"
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.helpTitle}>Still need help?</Text>
          </View>
          <Text style={styles.helpText}>
            Our support team is available 7 days a week to assist you with any questions or concerns.
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate("ContactForm")}
          >
            <Text style={styles.helpButtonText}>Submit a Request</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </Surface>
      </ScrollView>

      {/* Floating Action Button for Emergency */}
      <FAB
        style={styles.fab}
        icon="alert-circle"
        color="white"
        onPress={() => Linking.openURL("tel:+18001234567")}
        label="Emergency"
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
  headerContent: {
    paddingHorizontal: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  contactScroll: {
    marginHorizontal: -20,
  },
  contactContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 140,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
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
  faqSection: {
    marginTop: 30,
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
        shadowOpacity: 0.05,
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
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  faqQuestionContainer: {
    flex: 1,
    marginRight: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dark,
    lineHeight: 22,
  },
  faqDivider: {
    marginVertical: 12,
    backgroundColor: COLORS.lightGray,
  },
  faqAnswerContainer: {
    paddingTop: 5,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
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
  helpCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginTop: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark,
    marginLeft: 10,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  helpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  helpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.error,
  },
});

export default Support;