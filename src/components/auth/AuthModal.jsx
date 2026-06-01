import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';

const AuthModal = () => {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const {
    isAuthModalOpen,
    authModalMode,
    authPendingEmail,
    setAuthPendingEmail,
    closeAuthModal,
    switchAuthMode,
    showToast,
  } = useUI();
  const { mergeGuestCart } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP verification step state
  const [otpCode, setOtpCode] = useState('');
  const [resendIn, setResendIn] = useState(0); // resend cooldown (seconds)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Reset forms when modal closes or mode changes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setLoginForm({ email: '', password: '' });
      setRegisterForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setErrors({});
      setShowPassword(false);
      setOtpCode('');
      setResendIn(0);
    }
  }, [isAuthModalOpen]);

  // Resend cooldown countdown for the OTP step
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isAuthModalOpen, closeAuthModal]);

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    if (!registerForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!registerForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!registerForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(registerForm.password)
    ) {
      newErrors.password =
        'Password must include uppercase, lowercase, number, and a special character';
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move into the OTP step for a given email (used by both register & login).
  const goToOtpStep = (email, message) => {
    setAuthPendingEmail(email);
    setOtpCode('');
    setErrors({});
    setResendIn(60);
    switchAuthMode('otp');
    if (message) showToast(message, 'info');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(loginForm.email, loginForm.password);

      if (result.success) {
        showToast('Welcome back!', 'success');
        // Merge guest cart with user cart
        await mergeGuestCart();
        closeAuthModal();
      } else if (result.requiresOtp) {
        // Account exists but email isn't verified — backend sent a new code.
        goToOtpStep(result.email, result.message || 'Please verify your email.');
      } else {
        setErrors({ general: result.message });
        showToast(result.message || 'Login failed', 'error');
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    try {
      const result = await register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        password: registerForm.password,
      });
      if (result.success) {
        if (result.requiresOtp) {
          // Customer must verify email via OTP before the account is usable.
          goToOtpStep(result.email, result.message || 'Enter the code we emailed you.');
        } else if (result.autoLoggedIn) {
          // User was auto-logged in after registration (pre-verified accounts)
          showToast('Account created successfully! Welcome!', 'success');
          await mergeGuestCart();
          closeAuthModal();
        } else {
          // User needs to login manually
          showToast('Account created successfully! Please log in.', 'success');
          switchAuthMode('login');
          setRegisterForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
        }
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpCode)) {
      setErrors({ otp: 'Enter the 6-digit code' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const result = await verifyOtp(authPendingEmail, otpCode);
      if (result.success) {
        showToast('Email verified! Welcome to Ektaa Couture.', 'success');
        await mergeGuestCart();
        setAuthPendingEmail('');
        closeAuthModal();
      } else {
        setErrors({ otp: result.message });
        showToast(result.message || 'Verification failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const result = await resendOtp(authPendingEmail);
      showToast(
        result.message || (result.success ? 'A new code has been sent.' : 'Could not resend code.'),
        result.success ? 'success' : 'error'
      );
      if (result.success) {
        setResendIn(60);
        setOtpCode('');
        setErrors({});
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeAuthModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {authModalMode === 'login'
              ? 'Sign In'
              : authModalMode === 'register'
              ? 'Create Account'
              : 'Verify your email'}
          </h2>
          <button
            onClick={closeAuthModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {authModalMode === 'login' ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.email ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-primary ${
                      errors.password ? 'border-red-500' : 'border-form-border'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center text-sm">
                <Link
                  to="/forgot-password"
                  onClick={closeAuthModal}
                  className="text-text-body hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          ) : authModalMode === 'register' ? (
            // Register Form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                      errors.firstName ? 'border-red-500' : 'border-form-border'
                    }`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                      errors.lastName ? 'border-red-500' : 'border-form-border'
                    }`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.email ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-primary ${
                      errors.password ? 'border-red-500' : 'border-form-border'
                    }`}
                    placeholder="At least 8 chars, e.g. Password@1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary ${
                    errors.confirmPassword ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-text-body">
                We've sent a 6-digit code to{' '}
                <span className="font-medium text-text-primary">{authPendingEmail}</span>. Enter it
                below to verify your email.
              </p>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full px-4 py-2 border rounded-lg text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-primary ${
                    errors.otp ? 'border-red-500' : 'border-form-border'
                  }`}
                  placeholder="000000"
                  autoFocus
                />
                {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="text-center text-sm text-text-body">
                Didn't get the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendIn > 0 || isLoading}
                  className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchAuthMode('login')}
                  className="text-sm text-text-body hover:text-primary"
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* Switch Mode */}
          {authModalMode !== 'otp' && (
          <div className="mt-6 text-center text-sm text-text-body">
            {authModalMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchAuthMode('register')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchAuthMode('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
