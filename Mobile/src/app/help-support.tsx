import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  ArrowLeft,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Bug,
  Lightbulb,
  BookOpen,
  Sparkles,
  Mail,
  FileText,
  Shield,
  Info,
  X,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

/* =================================================
   FAQ DATA
================================================= */

const faqData = [
  {
    question: "How do I create a meal plan?",
    answer:
      "Go to the Meal Plan section and provide your preferences. Meal Planner will use your information to create a personalized meal plan.",
  },
  {
    question: "How does the AI generate meals?",
    answer:
      "The AI considers information such as your dietary preference, health goal, activity level, allergies, and other preferences to suggest suitable meals.",
  },
  {
    question: "How do I change my dietary preferences?",
    answer:
      "Go to Profile → Personal Information and update your dietary preference. Save your changes when you are finished.",
  },
  {
    question: "How do I add my food allergies?",
    answer:
      "Open Profile → Personal Information and enter your allergies or food restrictions in the Allergies / Food Restrictions field.",
  },
  {
    question: "How does the grocery list work?",
    answer:
      "Your grocery list can be generated from your meal plan so that you can see the ingredients needed for your planned meals.",
  },
  {
    question: "How do I update my pantry?",
    answer:
      "Use the Pantry section to manage ingredients you already have. This information can later be used by the AI when generating meal suggestions.",
  },
  {
    question: "How do I change my profile picture?",
    answer:
      "Go to Profile and tap the pencil icon on your profile picture. You can then choose a new picture from your Gallery.",
  },
];

/* =================================================
   MAIN SCREEN
================================================= */

export default function HelpSupportScreen() {
  const { colors } = useTheme();

  const [searchText, setSearchText] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  /* =========================================
     FILTER FAQ
  ========================================== */

  const filteredFaqs = faqData.filter((faq) => {
    const search = searchText.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      faq.question.toLowerCase().includes(search) ||
      faq.answer.toLowerCase().includes(search)
    );
  });

  /* =========================================
     CONTACT SUPPORT
  ========================================== */

  const handleContactSupport = async () => {
    const email = "support@mealplanner.com";

    const url = `mailto:${email}?subject=Meal Planner Support`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Contact Support",
          `Please email us at ${email}`
        );
      }
    } catch (error) {
      console.log("Email error:", error);

      Alert.alert(
        "Contact Support",
        `Please email us at ${email}`
      );
    }
  };

  /* =========================================
     REPORT PROBLEM
  ========================================== */

  const handleReportProblem = () => {
    Alert.alert(
      "Report a Problem",
      "Problem reporting will be connected to the backend later.",
      [
        {
          text: "OK",
        },
      ]
    );
  };

  /* =========================================
     FEEDBACK
  ========================================== */

  const handleFeedback = () => {
    Alert.alert(
      "Send Feedback",
      "Feedback submission will be connected to the backend later.",
      [
        {
          text: "OK",
        },
      ]
    );
  };

  /* =========================================
     HOW MEAL PLANNER WORKS
  ========================================== */

  const handleHowItWorks = () => {
    Alert.alert(
      "How Meal Planner Works",
      "Meal Planner uses your personal information, dietary preferences, goals, pantry items, and meal preferences to help create personalized meal plans."
    );
  };

  /* =========================================
     AI RECOMMENDATIONS
  ========================================== */

  const handleAiRecommendations = () => {
    Alert.alert(
      "AI Meal Recommendations",
      "Your AI recommendations will be based on your profile information, dietary preferences, goals, allergies, and available ingredients."
    );
  };

  /* =========================================
     TERMS
  ========================================== */

  const handleTerms = () => {
    Alert.alert(
      "Terms & Conditions",
      "Terms & Conditions will be added here."
    );
  };

  /* =========================================
     PRIVACY
  ========================================== */

  const handlePrivacy = () => {
    router.push("/privacy-security");
  };

  /* =========================================
     ABOUT
  ========================================== */

  const handleAbout = () => {
    Alert.alert(
      "About Meal Planner",
      "Meal Planner helps you plan meals, manage groceries, track pantry items, and receive personalized AI-powered meal recommendations.\n\nVersion 1.0.0"
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* =========================================
            HEADER
        ========================================== */}

        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
              },
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              strokeWidth={2.2}
            />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Help & Support
          </Text>

          <View style={styles.headerSpace} />
        </View>

        {/* =========================================
            INTRO
        ========================================== */}

        <View
          style={[
            styles.introCard,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <HelpCircle
              size={25}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              How can we help?
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Find answers, get support, or tell us
              how we can improve Meal Planner.
            </Text>
          </View>
        </View>

        {/* =========================================
            SEARCH
        ========================================== */}

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.input,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Search
            size={20}
            color={colors.textSecondary}
            strokeWidth={2}
          />

          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search help"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
          />

          {searchText.length > 0 && (
            <Pressable
              onPress={() => setSearchText("")}
            >
              <X
                size={18}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </Pressable>
          )}
        </View>

        {/* =========================================
            QUICK HELP
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Quick Help
        </Text>

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <ActionItem
            colors={colors}
            icon={
              <HelpCircle
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions"
            onPress={() => {
              setSearchText("");
            }}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <ActionItem
            colors={colors}
            icon={
              <BookOpen
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="How Meal Planner Works"
            subtitle="Learn how to use the app"
            onPress={handleHowItWorks}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <ActionItem
            colors={colors}
            icon={
              <Sparkles
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="AI Meal Recommendations"
            subtitle="Learn about personalized suggestions"
            onPress={handleAiRecommendations}
          />
        </View>

        {/* =========================================
            FAQ
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Frequently Asked Questions
        </Text>

        <View
          style={[
            styles.faqCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {filteredFaqs.length === 0 ? (
            <View style={styles.noResults}>
              <Search
                size={28}
                color={colors.textMuted}
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.noResultsTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                No results found
              </Text>

              <Text
                style={[
                  styles.noResultsText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Try searching with a different word.
              </Text>
            </View>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;

              return (
                <View key={faq.question}>
                  <Pressable
                    style={styles.faqQuestion}
                    onPress={() =>
                      setExpandedFaq(
                        isExpanded ? null : index
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.faqQuestionText,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {faq.question}
                    </Text>

                    <ChevronDown
                      size={20}
                      color={colors.textSecondary}
                      strokeWidth={2}
                      style={{
                        transform: [
                          {
                            rotate: isExpanded
                              ? "180deg"
                              : "0deg",
                          },
                        ],
                      }}
                    />
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                      <Text
                        style={[
                          styles.faqAnswer,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {faq.answer}
                      </Text>
                    </View>
                  )}

                  {index < filteredFaqs.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor: colors.divider,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* =========================================
            CONTACT US
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Contact Us
        </Text>

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <ActionItem
            colors={colors}
            icon={
              <MessageCircle
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Contact Support"
            subtitle="Get help from our support team"
            onPress={handleContactSupport}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <ActionItem
            colors={colors}
            icon={
              <Bug
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Report a Problem"
            subtitle="Tell us about an issue with the app"
            onPress={handleReportProblem}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <ActionItem
            colors={colors}
            icon={
              <Lightbulb
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Send Feedback"
            subtitle="Share your ideas and suggestions"
            onPress={handleFeedback}
          />
        </View>

        {/* =========================================
            APP INFORMATION
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          App Information
        </Text>

        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <ActionItem
            colors={colors}
            icon={
              <FileText
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Terms & Conditions"
            subtitle="Read our terms and conditions"
            onPress={handleTerms}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <ActionItem
            colors={colors}
            icon={
              <Shield
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Privacy Policy"
            subtitle="Learn how your data is handled"
            onPress={handlePrivacy}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <ActionItem
            colors={colors}
            icon={
              <Info
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="About Meal Planner"
            subtitle="App information and version"
            onPress={handleAbout}
          />
        </View>

        {/* =========================================
            SUPPORT EMAIL
        ========================================== */}

        <View
          style={[
            styles.emailCard,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <View
            style={[
              styles.emailIcon,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Mail
              size={20}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.emailTextContainer}>
            <Text
              style={[
                styles.emailTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Need more help?
            </Text>

            <Text
              style={[
                styles.emailSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Contact us at support@mealplanner.com
            </Text>
          </View>
        </View>

        {/* =========================================
            VERSION
        ========================================== */}

        <Text
          style={[
            styles.version,
            {
              color: colors.textMuted,
            },
          ]}
        >
          Meal Planner • Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =================================================
   ACTION ITEM
================================================= */

function ActionItem({
  colors,
  icon,
  title,
  subtitle,
  onPress,
}: {
  colors: any;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.actionItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.itemIcon,
          {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.itemTextContainer}>
        <Text
          style={[
            styles.itemTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.itemSubtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <ChevronRight
        size={20}
        color={colors.textMuted}
        strokeWidth={2}
      />
    </Pressable>
  );
}

/* =================================================
   STYLES
================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    marginHorizontal: 8,
  },

  headerSpace: {
    width: 42,
  },

  /* INTRO */

  introCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  introTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },

  introText: {
    fontSize: 12,
    lineHeight: 18,
  },

  /* SEARCH */

  searchContainer: {
    minHeight: 54,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 28,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  /* MENU */

  menuCard: {
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 27,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  actionItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  itemSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },

  divider: {
    height: 1,
    marginLeft: 54,
  },

  /* FAQ */

  faqCard: {
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 27,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  faqQuestion: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 10,
    lineHeight: 19,
  },

  faqAnswerContainer: {
    paddingBottom: 15,
    paddingRight: 15,
  },

  faqAnswer: {
    fontSize: 12,
    lineHeight: 19,
  },

  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 35,
  },

  noResultsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
  },

  noResultsText: {
    fontSize: 12,
    marginTop: 4,
  },

  /* EMAIL */

  emailCard: {
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  emailIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  emailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  emailTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },

  emailSubtitle: {
    fontSize: 11,
  },

  /* VERSION */

  version: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 2,
  },
});