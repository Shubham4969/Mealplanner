import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { Mic, X, SlidersHorizontal } from "lucide-react-native";
import { router } from "expo-router";

import {
  sendChatMessage,
  transcribeAudio,
  textToSpeech,
  getStoredUserId,
} from "../services/api";

const SILENCE_DURATION_MS = 1800;
const MAX_RECORDING_MS = 30000;
const SPEECH_THRESHOLD_DB = -42;

export default function VoiceScreen() {
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });

  const recorderState = useAudioRecorderState(recorder, 200);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");

  const [statusText, setStatusText] = useState(
    "Tap the microphone and start speaking"
  );

  const recordingRef = useRef(false);
  const processingRef = useRef(false);
  const speechDetectedRef = useRef(false);
  const mountedRef = useRef(true);

  const silenceTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulse = useRef(new Animated.Value(1)).current;

  // Request microphone permission.
  useEffect(() => {
    mountedRef.current = true;

    async function setupAudio() {
      try {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!mountedRef.current) return;

        if (!permission.granted) {
          Alert.alert(
            "Microphone Permission",
            "Please allow microphone access to use Voice Assistant."
          );
          return;
        }

        setPermissionGranted(true);

        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (error) {
        console.error("Audio setup error:", error);

        if (mountedRef.current) {
          Alert.alert(
            "Audio Error",
            "Unable to initialize the microphone."
          );
        }
      }
    }

    void setupAudio();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Animate the voice orb.
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }, []);

  // Record -> transcribe -> AI response -> speak response.
  const stopAndSubmit = useCallback(async () => {
    if (!recordingRef.current || processingRef.current) {
      return;
    }

    processingRef.current = true;
    clearTimers();

    try {
      setStatusText("Finishing your question...");

      await recorder.stop();

      recordingRef.current = false;
      setIsRecording(false);

      const recordedUri = recorder.uri;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (!recordedUri) {
        throw new Error(
          "No recording was saved. Please try again."
        );
      }

      const FileSystem = await import(
        "expo-file-system/legacy"
      );

      const fileInfo =
        await FileSystem.getInfoAsync(recordedUri);

      if (
        !fileInfo.exists ||
        !("size" in fileInfo) ||
        fileInfo.size <= 0
      ) {
        throw new Error(
          "The recording is empty. Please try again."
        );
      }

      // STEP 1: Convert recorded audio to text.
      setIsTranscribing(true);
      setStatusText("Transcribing your question...");

      const recognizedText = (
        await transcribeAudio(recordedUri)
      ).trim();

      if (!recognizedText) {
        throw new Error(
          "No speech was detected. Please try again."
        );
      }

      console.log(
        "Recognized question:",
        recognizedText
      );

      setTranscript(recognizedText);
      setIsTranscribing(false);

      // STEP 2: Send the question to FastAPI /chat.
      setIsThinking(true);
      setStatusText("Meal Planner is thinking...");

      const userId = await getStoredUserId();

      const result = await sendChatMessage(
        recognizedText,
        userId
      );

      const responseText = String(
        result.response ?? result.message ?? ""
      ).trim();

      if (!responseText) {
        throw new Error(
          "Meal Planner returned an empty answer."
        );
      }

      setAnswer(responseText);
      setIsThinking(false);

      // STEP 3: Generate speech.
      setStatusText(
        "Preparing your voice response..."
      );

      const audioBase64 =
        await textToSpeech(responseText);

      if (!audioBase64) {
        throw new Error(
          "The server returned no speech audio."
        );
      }

      // STEP 4: Save MP3 locally.
      const audioUri =
        `${FileSystem.cacheDirectory}meal_planner_reply_${Date.now()}.mp3`;

      await FileSystem.writeAsStringAsync(
        audioUri,
        audioBase64,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      // STEP 5: Play audio.
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      setIsSpeaking(true);
      setStatusText("Meal Planner is speaking...");

      const player = createAudioPlayer({
        uri: audioUri,
      });

      try {
        player.volume = 1;
        player.muted = false;

        console.log(
          "TTS Base64 length:",
          audioBase64.length
        );

        console.log(
          "Saved audio URI:",
          audioUri
        );

        const audioInfo =
          await FileSystem.getInfoAsync(audioUri);

        console.log(
          "Saved audio file:",
          audioInfo
        );

        if (
          !audioInfo.exists ||
          !("size" in audioInfo) ||
          audioInfo.size <= 0
        ) {
          throw new Error(
            "The generated audio file is empty."
          );
        }

        setIsSpeaking(true);
        setStatusText(
          "Meal Planner is speaking..."
        );

        await new Promise<void>(
          (resolve, reject) => {
            let finished = false;

            const subscription =
              player.addListener(
                "playbackStatusUpdate",
                (status) => {
                  console.log(
                    "Audio playback status:",
                    status
                  );

                  if (
                    status.didJustFinish &&
                    !finished
                  ) {
                    finished = true;
                    subscription.remove();
                    resolve();
                  }
                }
              );

            try {
              player.play();
            } catch (error) {
              if (!finished) {
                finished = true;
                subscription.remove();

                reject(
                  error instanceof Error
                    ? error
                    : new Error(
                        "Audio playback failed."
                      )
                );
              }
            }
          }
        );
      } finally {
        player.remove();
        setIsSpeaking(false);
      }

      setStatusText(
        "Tap the microphone to ask another question"
      );

      console.log(
        "Voice response finished."
      );
    } catch (error) {
      console.error(
        "Voice assistant error:",
        error
      );

      setStatusText(
        "Tap the microphone to try again"
      );

      if (mountedRef.current) {
        Alert.alert(
          "Voice Assistant Error",
          error instanceof Error
            ? error.message
            : "Unable to process your voice query."
        );
      }
    } finally {
      clearTimers();

      recordingRef.current = false;
      processingRef.current = false;

      if (mountedRef.current) {
        setIsRecording(false);
        setIsTranscribing(false);
        setIsThinking(false);
        setIsSpeaking(false);

        try {
          await setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
          });
        } catch (error) {
          console.warn(
            "Could not restore audio mode:",
            error
          );
        }
      }
    }
  }, [clearTimers, recorder]);

  // Automatically stop after the user pauses speaking.
  useEffect(() => {
    if (
      !isRecording ||
      !recordingRef.current
    ) {
      return;
    }

    const level = recorderState.metering;

    if (
      typeof level !== "number" ||
      !Number.isFinite(level)
    ) {
      return;
    }

    if (level > SPEECH_THRESHOLD_DB) {
      speechDetectedRef.current = true;

      if (silenceTimerRef.current) {
        clearTimeout(
          silenceTimerRef.current
        );

        silenceTimerRef.current = null;
      }

      setStatusText(
        "Listening... pause when you finish"
      );

      return;
    }

    if (
      !speechDetectedRef.current ||
      silenceTimerRef.current
    ) {
      return;
    }

    silenceTimerRef.current =
      setTimeout(() => {
        silenceTimerRef.current = null;
        void stopAndSubmit();
      }, SILENCE_DURATION_MS);
  }, [
    recorderState.metering,
    isRecording,
    stopAndSubmit,
  ]);

  // Safety timeout for recordings.
  useEffect(() => {
    if (!isRecording) return;

    maxTimerRef.current = setTimeout(() => {
      void stopAndSubmit();
    }, MAX_RECORDING_MS);

    return () => {
      if (maxTimerRef.current) {
        clearTimeout(
          maxTimerRef.current
        );

        maxTimerRef.current = null;
      }
    };
  }, [isRecording, stopAndSubmit]);

  // Stop recording if this screen is closed.
  useEffect(() => {
    return () => {
      clearTimers();

      if (recordingRef.current) {
        void recorder
          .stop()
          .catch(() => undefined);
      }
    };
  }, [clearTimers, recorder]);

  const startRecording = async () => {
    if (
      processingRef.current ||
      recordingRef.current
    ) {
      return;
    }

    processingRef.current = true;

    try {
      if (!permissionGranted) {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow microphone access in Android Settings."
          );

          return;
        }

        setPermissionGranted(true);
      }

      setTranscript("");
      setAnswer("");
      setStatusText(
        "Starting microphone..."
      );

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      clearTimers();

      speechDetectedRef.current = false;

      await recorder.prepareToRecordAsync();

      recorder.record();

      recordingRef.current = true;
      setIsRecording(true);

      setStatusText(
        "Listening... speak your question"
      );

      console.log(
        "Voice recording started."
      );
    } catch (error) {
      console.error(
        "Could not start recording:",
        error
      );

      Alert.alert(
        "Recording Error",
        error instanceof Error
          ? error.message
          : "Unable to start recording."
      );

      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch {
        // Ignore audio-mode cleanup errors.
      }
    } finally {
      processingRef.current = false;
    }
  };

  const handleMicPress = () => {
    if (recordingRef.current) {
      void stopAndSubmit();
    } else {
      void startRecording();
    }
  };

  const handleClose = async () => {
    clearTimers();

    if (
      recordingRef.current &&
      !processingRef.current
    ) {
      processingRef.current = true;

      try {
        await recorder.stop();

        recordingRef.current = false;

        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (error) {
        console.warn(
          "Error closing recorder:",
          error
        );
      } finally {
        processingRef.current = false;
      }
    }

    router.back();
  };

  const busy =
    isTranscribing ||
    isThinking ||
    isSpeaking;

  const displayedStatus =
    isTranscribing
      ? "Transcribing your question..."
      : isSpeaking
        ? "Meal Planner is speaking..."
        : isThinking
          ? "Meal Planner is thinking..."
          : statusText;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>

        <Pressable
          style={styles.settingsButton}
          onPress={() =>
            Alert.alert(
              "Voice Assistant",
              "Speak naturally. Recording stops after a short pause. Meal Planner will process your question and speak its response."
            )
          }
        >
          <SlidersHorizontal
            size={20}
            color="#777777"
          />
        </Pressable>

        {/* SCROLLABLE CONTENT */}
        <View style={styles.centerContent}>
          <ScrollView
            style={styles.resultsScroll}
            contentContainerStyle={
              styles.resultsContent
            }
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >

            <Animated.View
              style={[
                styles.orb,
                isRecording &&
                  styles.activeOrb,
                {
                  transform: [
                    {
                      scale: isRecording
                        ? pulse
                        : 1,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.orbBlue} />

              <View
                style={styles.orbHighlight}
              />
            </Animated.View>

            <Text style={styles.statusText}>
              {displayedStatus}
            </Text>

            {transcript !== "" && (
              <View
                style={styles.resultCard}
              >
                <Text
                  style={styles.resultLabel}
                >
                  YOU SAID
                </Text>

                <Text
                  style={styles.resultText}
                >
                  {transcript}
                </Text>
              </View>
            )}

            {answer !== "" && (
              <View
                style={styles.resultCard}
              >
                <Text
                  style={styles.resultLabel}
                >
                  MEAL PLANNER
                </Text>

                <Text
                  style={styles.resultText}
                >
                  {answer}
                </Text>
              </View>
            )}

            {busy && (
              <ActivityIndicator
                color="#1686F5"
                style={{
                  marginTop: 15,
                }}
              />
            )}

          </ScrollView>
        </View>

        {/* FIXED BOTTOM CONTROLS */}
        <View style={styles.bottomControls}>

          <Pressable
            style={[
              styles.controlButton,
              isRecording &&
                styles.recordingButton,
              busy &&
                styles.disabledButton,
            ]}
            onPress={handleMicPress}
            disabled={busy}
            accessibilityLabel="Start or stop voice recording"
          >
            {busy ? (
              <ActivityIndicator
                color="#222222"
              />
            ) : (
              <Mic
                size={25}
                color={
                  isRecording
                    ? "#FFFFFF"
                    : "#222222"
                }
                strokeWidth={2.2}
              />
            )}
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={() =>
              void handleClose()
            }
            accessibilityLabel="Close voice assistant"
          >
            <X
              size={26}
              color="#222222"
              strokeWidth={2.2}
            />
          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },

  settingsButton: {
    position: "absolute",
    top: 18,
    right: 24,
    zIndex: 2,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * The center area takes the available space.
   * minHeight: 0 is important so ScrollView
   * is allowed to shrink inside the flex layout.
   */
  centerContent: {
    flex: 1,
    minHeight: 0,
  },

  /*
   * Scrollable response area.
   */
  resultsScroll: {
    flex: 1,
  },

  /*
   * Allows the content to fill the screen when
   * the answer is short, while still allowing
   * scrolling when the answer becomes long.
   */
  resultsContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 36,
    paddingBottom: 24,
  },

  orb: {
    width: 188,
    height: 188,
    borderRadius: 94,
    overflow: "hidden",
    backgroundColor: "#DDF7FF",

    shadowColor: "#1686F5",
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 4,
  },

  activeOrb: {
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },

  orbBlue: {
    position: "absolute",
    bottom: -38,
    left: -18,
    width: 225,
    height: 115,
    borderRadius: 90,
    backgroundColor: "#1686F5",
    transform: [
      {
        rotate: "-10deg",
      },
    ],
  },

  orbHighlight: {
    position: "absolute",
    right: 10,
    bottom: 12,
    width: 85,
    height: 50,
    borderRadius: 40,
    backgroundColor: "#A5E8FA",
    opacity: 0.95,
    transform: [
      {
        rotate: "-25deg",
      },
    ],
  },

  statusText: {
    marginTop: 30,
    color: "#747B84",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 12,
  },

  /*
   * IMPORTANT:
   * No maxHeight here.
   * The whole response can now grow inside
   * the ScrollView.
   */
  resultCard: {
    width: "100%",
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F5F7FA",
  },

  resultLabel: {
    color: "#7A8491",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },

  resultText: {
    color: "#20242A",
    fontSize: 14,
    lineHeight: 21,
  },

  /*
   * These controls stay fixed at the bottom.
   */
  bottomControls: {
    minHeight: 96,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  controlButton: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  recordingButton: {
    backgroundColor: "#1686F5",
  },

  disabledButton: {
    opacity: 0.6,
  },
});