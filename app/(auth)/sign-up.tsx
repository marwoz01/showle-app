import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "@/i18n";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleGoogleSignUp = useCallback(async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({ scheme: "showlemobileapp" }),
        redirectUrlComplete: AuthSession.makeRedirectUri({ scheme: "showlemobileapp" }),
      });

      if (createdSessionId) {
        await (ssoSetActive ?? setActive)({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        t.auth.signUpError;
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        t.auth.signUpError;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        t.auth.signUpError;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        className="flex-1 justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Header */}
        <View className="items-center mb-10">
          <View
            className="h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ backgroundColor: "rgba(124,77,255,0.15)" }}
          >
            <Ionicons name="film" size={32} color="#7c4dff" />
          </View>
          <Text className="text-3xl font-heading-bold text-primary">
            Showle
          </Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            {pendingVerification
              ? t.auth.verificationSubtitle
              : t.auth.signUpSubtitle}
          </Text>
        </View>

        {!pendingVerification && (
          <>
            {/* Google OAuth */}
            <Pressable
              onPress={handleGoogleSignUp}
              disabled={googleLoading}
              className="flex-row items-center justify-center gap-3 rounded-xl border border-border bg-card py-3.5 mb-6"
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#8a8a9a" />
              ) : (
                <Ionicons name="logo-google" size={20} color="#e8e8ed" />
              )}
              <Text className="text-base font-sans-medium text-primary">
                {t.auth.continueWithGoogle}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center gap-4 mb-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs font-sans-medium text-muted-foreground">
                {t.auth.orWithEmail}
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>
          </>
        )}

        {pendingVerification ? (
          /* Verification form */
          <View className="gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-sans-medium text-muted-foreground">
                {t.auth.verificationCode}
              </Text>
              <TextInput
                placeholder="123456"
                placeholderTextColor="#8a8a9a"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                className="rounded-xl border border-border bg-card px-4 py-3.5 text-center text-2xl font-heading-bold text-primary tracking-widest"
              />
            </View>

            {error ? (
              <View
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: "rgba(255,82,82,0.1)" }}
              >
                <Text style={{ color: "#ff5252", fontSize: 13, fontWeight: "500" }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleVerify}
              disabled={loading || !code}
              className="mt-2 items-center rounded-xl bg-accent py-4"
              style={[!code && { opacity: 0.5 }]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-sans-bold text-accent-foreground">
                  {t.auth.verify}
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          /* Sign up form */
          <View className="gap-4">
            <View>
              <Text className="mb-1.5 text-sm font-sans-medium text-muted-foreground">
                {t.auth.email}
              </Text>
              <TextInput
                placeholder={t.auth.emailPlaceholder}
                placeholderTextColor="#8a8a9a"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                className="rounded-xl border border-border bg-card px-4 py-3.5 text-base font-sans-medium text-primary"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-sans-medium text-muted-foreground">
                {t.auth.password}
              </Text>
              <View className="flex-row items-center rounded-xl border border-border bg-card">
                <TextInput
                  placeholder={t.auth.passwordPlaceholder}
                  placeholderTextColor="#8a8a9a"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  className="flex-1 px-4 py-3.5 text-base font-sans-medium text-primary"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="px-4"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8a8a9a"
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: "rgba(255,82,82,0.1)" }}
              >
                <Text style={{ color: "#ff5252", fontSize: 13, fontWeight: "500" }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSignUp}
              disabled={loading || !email || !password}
              className="mt-2 items-center rounded-xl bg-accent py-4"
              style={[(!email || !password) && { opacity: 0.5 }]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-sans-bold text-accent-foreground">
                  {t.auth.signUp}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Footer */}
        {!pendingVerification && (
          <View className="mt-8 flex-row items-center justify-center gap-1">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              {t.auth.haveAccount}
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text style={{ color: "#7c4dff", fontSize: 14, fontWeight: "600" }}>
                  {t.auth.signIn}
                </Text>
              </Pressable>
            </Link>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
