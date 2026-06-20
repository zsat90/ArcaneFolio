import React, { useState } from 'react';
import { useRouter } from 'next/router';
import TextInput from '../components/TextInput';
import Buttons from '../components/Login/Button';
import {
  handleEmailChange,
  handleNameChange,
  handlePasswordChange,
  handlePasswordMatch,
} from '../utils/LoginAuth';
import { getAuthErrorMessage, signInWithGoogle, signup } from '../utils/auth/authService';
import globalStyles from '../styles/styles';
import wizard from '../assets/images/wizard.webp';
import ImageBackgroundWrapper from '../components/imageBackground';

export default function CreateAccountPage() {
  const router = useRouter();
  const navigation = { navigate: (route: string) => {
    const map: Record<string,string> = { Login: '/login' };
    router.push(map[route] || '/');
  }};

  const [name, setName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitCreateAccount = async () => {
    setFormError('');

    const hasErrors = Boolean(name.error || email.error || password.error || confirmPassword.error);
    const hasMissingFields = !name.value || !email.value || !password.value || !confirmPassword.value;

    if (hasErrors || hasMissingFields) {
      setFormError('Please complete the form before creating your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(email.value, password.value, name.value);
      router.push('/characters');
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
            submitCreateAccount();
          }}
          style={{ width: '100%', maxWidth: 420, backgroundColor: 'rgba(255,255,255,0.92)', padding: 24, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}
        >
          <img className="portrait" src={typeof wizard === 'string' ? wizard : wizard.src} alt="Portrait" />
          <h1 style={globalStyles.title}>Create Account</h1>
          <TextInput label="Name" value={name.value} onChangeText={(text) => handleNameChange(text, setName)} errorText={name.error} autoComplete="name" />
          <TextInput label="Email" value={email.value} onChangeText={(text) => handleEmailChange(text, setEmail)} errorText={email.error} autoComplete="email" />
          <TextInput label="Password" value={password.value} onChangeText={(text) => handlePasswordChange(text, setPassword)} errorText={password.error} secureTextEntry autoComplete="new-password" />
          <TextInput label="Confirm Password" value={confirmPassword.value} onChangeText={(text) => handlePasswordMatch(password.value, text, setConfirmPassword)} errorText={confirmPassword.error} secureTextEntry autoComplete="new-password" />

          {formError ? <p role="alert" style={{ color: '#b00020', margin: '12px 0 0' }}>{formError}</p> : null}

          <div style={{ width: '100%', marginTop: 24 }}>
            <Buttons type="submit" mode="contained" disabled={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? 'Creating account...' : 'Create your account'}
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
              Already have an account?{' '}
              <button type="button" style={{ fontSize: 18, textDecoration: 'underline', color: '#231F20', background: 'transparent', border: 0, cursor: 'pointer' }} onClick={() => navigation.navigate('Login')}>
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </ImageBackgroundWrapper>
  );
}
