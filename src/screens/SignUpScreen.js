import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ImageBackground,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";

const SignUpScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [errors, setErrors] = useState({});
  const otpInputs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      console.log(
        "Auth state changed:",
        user ? `User signed in: ${user.uid}` : "User signed out"
      );
    });
    return unsubscribe;
  }, []);

  //  Send OTP using Firebase (testing-friendly)
  const handleSendOtp = async () => {
    if (!phone || phone.length !== 10) {
      setErrors({ phone: "Enter valid 10-digit mobile number" });
      return;
    }

    try {
      setLoading(true);
      const fullPhone = "+91" + phone;

      //  Check if this is a Firebase test number
      if (fullPhone === "+91 9876543210") {
        alert("Test OTP: 123456");
        setConfirmation({ isTest: true });
        setStep("otp");
        setLoading(false);
        return;
      }

      const confirmationResult = await auth().signInWithPhoneNumber(fullPhone);
      setConfirmation(confirmationResult);
      setStep("otp");
      alert("OTP sent! Check your phone.");
    } catch (err) {
      console.error("Firebase OTP send error:", err);
      alert(
        "Failed to send OTP. Use a test number if you're on an emulator or no billing is enabled."
      );
    } finally {
      setLoading(false);
    }
  };

  //  Verify OTP using Firebase or test OTP
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setErrors({ otpCode: "Enter valid 6-digit OTP" });
      return;
    }

    try {
      setLoading(true);

      //  Handle Firebase test OTP
      if (confirmation?.isTest) {
        if (otpCode === "123456") {
          alert("✅ Test login successful!");
          navigation.replace("HomeScreen");
          return;
        } else {
          alert(" Wrong test OTP.");
          return;
        }
      }

      const userCredential = await confirmation.confirm(otpCode);

      if (userCredential.user) {
        console.log("Firebase User signed in:", userCredential.user.uid);
        alert("Sign in successful!");
        navigation.replace("HomeScreen");
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
      alert("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    if (/^\d$/.test(text) || text === "") {
      let otpArray = otpCode.split("");
      otpArray[index] = text;
      setOtp(otpArray.join(""));

      if (text && index < 5) otpInputs.current[index + 1].focus();
      if (!text && index > 0) otpInputs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <ImageBackground
        source={require("../assets/bg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome to RecomGo</Text>
          <Text style={styles.subtitle}>
            {step === "phone"
              ? "Sign up with your phone number"
              : "Enter OTP"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === "phone" ? "Sign Up" : "Verify OTP"}
            </Text>

            {step === "phone" && (
              <>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInputBox}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    placeholder="Enter mobile number"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ""));
                      if (errors.phone)
                        setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    style={styles.phoneInput}
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && (
                  <Text style={styles.error}>{errors.phone}</Text>
                )}

                <Pressable
                  style={styles.loginButton}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  <Text style={styles.loginText}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Text>
                </Pressable>
              </>
            )}

            {step === "otp" && (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <View style={styles.otpContainer}>
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => (otpInputs.current[i] = ref)}
                        style={styles.otpBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otpCode[i] || ""}
                        onChangeText={(text) => handleOtpChange(text, i)}
                      />
                    ))}
                </View>
                {errors.otpCode && (
                  <Text style={styles.error}>{errors.otpCode}</Text>
                )}
                <Pressable
                  style={styles.loginButton}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  <Text style={styles.loginText}>
                    {loading ? "Verifying..." : "Verify & Sign Up"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "400", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 24, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "400", marginBottom: 15, textAlign: "start" },
  label: { fontSize: 13, color: "#666", marginTop: 8, marginBottom: 4 },
  phoneInputBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  countryCode: { fontSize: 16, marginRight: 6, color: "black" },
  phoneInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: "black" },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 40,
    height: 50,
    textAlign: "center",
    fontSize: 18,
  },
  error: { color: "red", fontSize: 12, marginBottom: 6 },
  loginButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    marginTop: 22,
    alignItems: "center",
  },
  loginText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
