import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { useTheme } from "../context/ThemeContext";

export default function VoiceScreen() {
  const { colors } = useTheme();

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const recorderState =
    useAudioRecorderState(recorder);

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  const [recordingUri, setRecordingUri] =
    useState<string | null>(null);

  useEffect(() => {
    async function setupAudio() {
      try {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Microphone permission",
            "Microphone permission is required."
          );
          return;
        }

        setPermissionGranted(true);

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch {
        Alert.alert(
          "Audio error",
          "Unable to initialize microphone."
        );
      }
    }

    setupAudio();
  }, []);

  const startRecording = async () => {
    if (!permissionGranted) {
      Alert.alert(
        "Permission required",
        "Please allow microphone access."
      );
      return;
    }

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert(
        "Recording error",
        "Unable to start recording."
      );
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();

      setRecordingUri(recorder.uri ?? null);
    } catch {
      Alert.alert(
        "Recording error",
        "Unable to stop recording."
      );
    }
  };

  const isRecording = recorderState.isRecording;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Voice Assistant
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Speak naturally with your Meal Planner.
      </Text>

      <View
        style={[
          styles.voiceCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.microphone,
            {
              backgroundColor: isRecording
                ? colors.dangerLight
                : colors.cardSecondary,
            },
          ]}
        >
          <Text style={styles.microphoneText}>
            {isRecording ? "🔴" : "🎙️"}
          </Text>
        </View>

        <Text
          style={[
            styles.voiceTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {isRecording
            ? "Listening..."
            : "Ready to listen"}
        </Text>

        <Text
          style={[
            styles.voiceDescription,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {isRecording
            ? "Speak your meal planning request."
            : "Tap the button and start speaking."}
        </Text>

        <Pressable
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording
                ? colors.danger
                : "#208AEF",
            },
          ]}
          onPress={
            isRecording
              ? stopRecording
              : startRecording
          }
        >
          <Text style={styles.recordText}>
            {isRecording
              ? "Stop Recording"
              : "Start Recording"}
          </Text>
        </Pressable>
      </View>

      {recordingUri && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.resultTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Recording created
          </Text>

          <Text
            style={[
              styles.uri,
              {
                color: colors.textSecondary,
              },
            ]}
            numberOfLines={3}
          >
            {recordingUri}
          </Text>

          <Text
            style={[
              styles.note,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            This audio will later be sent to your FastAPI
            voice endpoint for transcription.
          </Text>
        </View>
      )}

      <View
        style={[
          styles.exampleCard,
          {
            backgroundColor: colors.primaryLight,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.exampleTitle,
            {
              color: colors.primary,
            },
          ]}
        >
          Try saying
        </Text>

        <Text
          style={[
            styles.example,
            {
              color: colors.text,
            },
          ]}
        >
          “Make a healthy 7 day meal plan.”
        </Text>

        <Text
          style={[
            styles.example,
            {
              color: colors.text,
            },
          ]}
        >
          “What do I have in my pantry?”
        </Text>

        <Text
          style={[
            styles.example,
            {
              color: colors.text,
            },
          ]}
        >
          “What should I buy this week?”
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 22,
  },

  voiceCard: {
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  microphone: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  microphoneText: {
    fontSize: 45,
  },

  voiceTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 20,
  },

  voiceDescription: {
    textAlign: "center",
    marginTop: 7,
  },

  recordButton: {
    width: "100%",
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
    marginTop: 24,
  },

  recordText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resultCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 15,
    borderWidth: 1,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  uri: {
    fontSize: 12,
    marginTop: 8,
  },

  note: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },

  exampleCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 15,
    borderWidth: 1,
  },

  exampleTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  example: {
    fontSize: 14,
    marginBottom: 7,
  },
});