import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TextInput from '../components/TextInput';
import Buttons from '../components/Login/Button';
import {
  handleLogin,
  handleCreateAccount,
  handleEmailChange,
  handlePasswordChange,
} from '../utils/LoginAuth';
import { getAuthErrorMessage, signInWithGoogle } from '../utils/auth/authService';
import globalStyles from '../styles/styles';
import wizard from '../assets/images/wizard.webp';
import ImageBackgroundWrapper from '../components/imageBackground';

export default function LoginPage() {
  const router = useRouter();
  const navigation = {
    navigate: (route: string) => {
      const map: Record<string, string> = {
        Login: '/login',
        CharacterSelection: '/characters',
        CreateAccount: '/create-account',
      };
      router.push(map[route] || '/');
    },
  };

  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async () => {
    setFormError('');
    setIsSubmitting(true);

    try {
      await handleLogin(email.value, password.value, navigation, setEmail, setPassword);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitGoogleLogin = async () => {
    setFormError('');
    setIsSubmitting(true);

    try {
      const signInMode = await signInWithGoogle();

      if (signInMode === 'popup') {
        router.push('/characters');
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackgroundWrapper>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitLogin();
          }}
          style={{ width: '100%', maxWidth: 420, backgroundColor: 'rgba(255,255,255,0.92)', padding: 24, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}
        >
          <img className="portrait" src={typeof wizard === 'string' ? wizard : wizard.src} alt="Portrait" />
          <h1 style={globalStyles.title}>Login</h1>

          <TextInput
            label="Email"
            value={email.value}
            onChangeText={(text) => handleEmailChange(text, setEmail)}
            errorText={email.error}
            autoComplete="email"
          />

          <TextInput
            label="Password"
            value={password.value}
            onChangeText={(text) => handlePasswordChange(text, setPassword)}
            errorText={password.error}
            secureTextEntry={!showPassword}
            onIconPress={() => setShowPassword(!showPassword)}
            icon={showPassword ? 'eye' : 'eye-off'}
            autoComplete="current-password"
          />

          <div style={{ marginTop: 8 }}>
            <p style={globalStyles.text}>Forgot Password?</p>
          </div>

          {formError ? <p role="alert" style={{ color: '#b00020', margin: '12px 0 0' }}>{formError}</p> : null}

          <div style={{ width: '100%', marginTop: 24 }}>
            <Buttons
              type="submit"
              mode="contained"
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Buttons>
          </div>

          <div style={{ width: '100%', marginTop: 12 }}>
            <Buttons
              mode="outlined"
              onPress={submitGoogleLogin}
              disabled={isSubmitting}
              style={{ width: '100%', backgroundColor: '#4285F4', color: '#fff', borderColor: '#4285F4' }}
            >
              Continue with Google
            </Buttons>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={globalStyles.text}>
              Don't have an account?{' '}
              <button type="button" style={{ fontSize: 18, textDecoration: 'underline', color: '#231F20', background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => handleCreateAccount(navigation)}>
                Register
              </button>
            </p>
          </div>
        </form>
      </div>
    </ImageBackgroundWrapper>
  );
}
