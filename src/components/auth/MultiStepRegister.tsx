import React, { useState } from 'react';
import { useAuth } from '../../auth/useAuth';

interface MultiStepRegisterProps {
  onSwitchToLogin: () => void;
}

const STEPS = [
  { id: 1, title: 'Personal Info', ariaLabel: 'Step 1 of 3: Personal information' },
  { id: 2, title: 'Account Details', ariaLabel: 'Step 2 of 3: Account details' },
  { id: 3, title: 'Review & Submit', ariaLabel: 'Step 3 of 3: Review and submit' },
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 100;

export const MultiStepRegister: React.FC<MultiStepRegisterProps> = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login, status } = useAuth();

  const inputBase =
    'appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm rounded-md';

  const validateStep1 = (): boolean => {
    setError('');
    if (!name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (name.length > MAX_NAME_LENGTH) {
      setError(`Name must be at most ${MAX_NAME_LENGTH} characters`);
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrevious = () => {
    setError('');
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;
    if (!validateStep1() || !validateStep2()) {
      setStep(1);
      return;
    }
    setError('');
    try {
      await login(email, password);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-md w-full space-y-6 text-center">
          <div
            className="rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-6"
            role="alert"
          >
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
              Account created successfully!
            </h2>
            <p className="mt-2 text-green-700 dark:text-green-300">
              You have been logged in. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <nav aria-label="Registration progress" className="mt-4">
            <ol className="flex justify-center gap-2" role="list">
              {STEPS.map((s) => (
                <li
                  key={s.id}
                  aria-label={s.ariaLabel}
                  aria-current={step === s.id ? 'step' : undefined}
                  className={`flex items-center gap-1 ${step === s.id ? 'font-semibold text-blue-600' : 'text-gray-500'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm"
                    aria-hidden="true">
                    {s.id}
                  </span>
                  {s.id < 3 && <span className="text-gray-300" aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              className="text-red-500 text-sm text-center p-3 rounded-md bg-red-50 dark:bg-red-900/20"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div role="group" aria-labelledby="step1-heading">
              <h3 id="step1-heading" className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'name-error' : undefined}
                className={`${inputBase} border-gray-300`}
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span id="name-error" className="sr-only">{error}</span>
              <p className="mt-1 text-xs text-gray-500">
                Maximum {MAX_NAME_LENGTH} characters
              </p>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div role="group" aria-labelledby="step2-heading">
              <h3 id="step2-heading" className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={!!error}
                    className={`${inputBase} border-gray-300`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby="password-hint"
                    className={`${inputBase} border-gray-300`}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p id="password-hint" className="mt-1 text-xs text-gray-500">
                    At least {MIN_PASSWORD_LENGTH} characters
                  </p>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={!!error}
                    className={`${inputBase} border-gray-300`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div role="group" aria-labelledby="step3-heading">
              <h3 id="step3-heading" className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Review your information
              </h3>
              <dl className="space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                  <dd className="text-gray-900 dark:text-white">{name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-gray-900 dark:text-white">{email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</dt>
                  <dd className="text-gray-900 dark:text-white">••••••••</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="flex gap-3 justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Go to previous step"
              >
                Previous
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Go to next step"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'checking'}
                className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                aria-busy={status === 'checking'}
                aria-live="polite"
              >
                {status === 'checking' ? 'Creating account...' : 'Create account'}
              </button>
            )}
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
