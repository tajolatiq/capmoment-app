// app/(auth)/login.tsx

import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/auth.styles';
import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* BRAND SECTION */}
      <View style={styles.brandSection}>
       <Image
  source={require("../../assets/images/splash-icon.png")}
  style={{
    width: 150,
    height: 150,
   
  }}
  resizeMode="contain"
/>

        
        <Text style={styles.tagline}>~capture your moment~</Text>
        
      </View>

      {/* ILLUSTRATION */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../assets/images/auth-bg-2.png')}
          style={styles.illustration}
          resizeMode="cover"
        />
        <Text style={styles.tagline}>Tajol, Ahmad, Anur, Azwar</Text>
        <Text style={styles.tagline}>UFH 2011 Mobile Application Development</Text>
      </View>

      {/* LOGIN SECTION */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={[
            styles.googleButton,
            loading && { opacity: 0.6 },
          ]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Ionicons name="logo-google" size={20} color={COLORS.surface} />
              </View>
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}
