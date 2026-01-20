import React, { useState, useEffect } from 'react';
import type {
  SettingsPanelProps,
  SettingsTab,
  ProfileSettings,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
} from '../../types/settings.types';
import { SettingsTabs } from '../ui/SettingsTabs';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';
import { FormSelect } from '../ui/FormSelect';
import { ToggleSwitch } from '../ui/ToggleSwitch';

const defaultProfile: ProfileSettings = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  location: '',
  website: '',
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  taskReminders: true,
  projectUpdates: true,
  weeklyDigest: false,
  marketingEmails: false,
};

const defaultPrivacy: PrivacySettings = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowSearch: true,
  dataSharing: false,
  analyticsTracking: true,
};

const defaultAppearance: AppearanceSettings = {
  theme: 'system',
  fontSize: 'medium',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  profile: initialProfile,
  notifications: initialNotifications,
  privacy: initialPrivacy,
  appearance: initialAppearance,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [profile, setProfile] = useState<ProfileSettings>(
    initialProfile || defaultProfile
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(
    initialNotifications || defaultNotifications
  );
  const [privacy, setPrivacy] = useState<PrivacySettings>(
    initialPrivacy || defaultPrivacy
  );
  const [appearance, setAppearance] = useState<AppearanceSettings>(
    initialAppearance || defaultAppearance
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Track changes
  useEffect(() => {
    const hasProfileChanges =
      JSON.stringify(profile) !== JSON.stringify(initialProfile || defaultProfile);
    const hasNotificationChanges =
      JSON.stringify(notifications) !==
      JSON.stringify(initialNotifications || defaultNotifications);
    const hasPrivacyChanges =
      JSON.stringify(privacy) !== JSON.stringify(initialPrivacy || defaultPrivacy);
    const hasAppearanceChanges =
      JSON.stringify(appearance) !==
      JSON.stringify(initialAppearance || defaultAppearance);

    setHasChanges(
      hasProfileChanges ||
        hasNotificationChanges ||
        hasPrivacyChanges ||
        hasAppearanceChanges
    );
  }, [profile, notifications, privacy, appearance, initialProfile, initialNotifications, initialPrivacy, initialAppearance]);

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return '';
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    return '';
  };

  const validateUrl = (url: string): string => {
    if (!url) return '';
    try {
      new URL(url);
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleSave = () => {
    // Validate current tab
    const newErrors: Record<string, string> = {};

    if (activeTab === 'profile') {
      if (!profile.firstName.trim()) newErrors['firstName'] = 'First name is required';
      if (!profile.lastName.trim()) newErrors['lastName'] = 'Last name is required';
      const emailError = validateEmail(profile.email);
      if (emailError) newErrors['email'] = emailError;
      const phoneError = validatePhone(profile.phone);
      if (phoneError) newErrors['phone'] = phoneError;
      if (profile.website) {
        const urlError = validateUrl(profile.website);
        if (urlError) newErrors['website'] = urlError;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const data =
        activeTab === 'profile'
          ? profile
          : activeTab === 'notifications'
          ? notifications
          : activeTab === 'privacy'
          ? privacy
          : appearance;

      onSave?.(activeTab, data);
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    // Reset to initial values
    if (initialProfile) setProfile(initialProfile);
    if (initialNotifications) setNotifications(initialNotifications);
    if (initialPrivacy) setPrivacy(initialPrivacy);
    if (initialAppearance) setAppearance(initialAppearance);
    setErrors({});
    setHasChanges(false);
    onCancel?.();
  };

  const renderProfileTab = () => (
    <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Profile Settings
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            value={profile.firstName}
            onChange={(value) => setProfile({ ...profile, firstName: value })}
            placeholder="Enter your first name"
            required
            error={errors['firstName']}
          />
          <FormInput
            label="Last Name"
            value={profile.lastName}
            onChange={(value) => setProfile({ ...profile, lastName: value })}
            placeholder="Enter your last name"
            required
            error={errors['lastName']}
          />
        </div>
        <FormInput
          label="Email"
          type="email"
          value={profile.email}
          onChange={(value) => setProfile({ ...profile, email: value })}
          placeholder="your.email@example.com"
          required
          error={errors['email']}
        />
        <FormInput
          label="Phone"
          type="tel"
          value={profile.phone}
          onChange={(value) => setProfile({ ...profile, phone: value })}
          placeholder="+1 (555) 123-4567"
          error={errors['phone']}
        />
        <FormTextarea
          label="Bio"
          value={profile.bio}
          onChange={(value) => setProfile({ ...profile, bio: value })}
          placeholder="Tell us about yourself..."
          rows={4}
        />
        <FormInput
          label="Location"
          value={profile.location}
          onChange={(value) => setProfile({ ...profile, location: value })}
          placeholder="City, Country"
        />
        <FormInput
          label="Website"
          type="url"
          value={profile.website}
          onChange={(value) => setProfile({ ...profile, website: value })}
          placeholder="https://example.com"
          error={errors['website']}
        />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div role="tabpanel" id="panel-notifications" aria-labelledby="tab-notifications">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Notification Settings
      </h2>
      <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
        <ToggleSwitch
          label="Email Notifications"
          checked={notifications.emailNotifications}
          onChange={(checked) =>
            setNotifications({ ...notifications, emailNotifications: checked })
          }
          description="Receive notifications via email"
        />
        <ToggleSwitch
          label="Push Notifications"
          checked={notifications.pushNotifications}
          onChange={(checked) =>
            setNotifications({ ...notifications, pushNotifications: checked })
          }
          description="Receive push notifications on your device"
        />
        <ToggleSwitch
          label="Task Reminders"
          checked={notifications.taskReminders}
          onChange={(checked) =>
            setNotifications({ ...notifications, taskReminders: checked })
          }
          description="Get reminded about upcoming tasks"
        />
        <ToggleSwitch
          label="Project Updates"
          checked={notifications.projectUpdates}
          onChange={(checked) =>
            setNotifications({ ...notifications, projectUpdates: checked })
          }
          description="Receive updates about project changes"
        />
        <ToggleSwitch
          label="Weekly Digest"
          checked={notifications.weeklyDigest}
          onChange={(checked) =>
            setNotifications({ ...notifications, weeklyDigest: checked })
          }
          description="Get a weekly summary of your activity"
        />
        <ToggleSwitch
          label="Marketing Emails"
          checked={notifications.marketingEmails}
          onChange={(checked) =>
            setNotifications({ ...notifications, marketingEmails: checked })
          }
          description="Receive promotional emails and updates"
        />
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div role="tabpanel" id="panel-privacy" aria-labelledby="tab-privacy">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Privacy Settings
      </h2>
      <div className="space-y-6">
        <FormSelect
          label="Profile Visibility"
          value={privacy.profileVisibility}
          onChange={(value) =>
            setPrivacy({ ...privacy, profileVisibility: value as any })
          }
          options={[
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' },
            { value: 'friends', label: 'Friends Only' },
          ]}
          description="Control who can view your profile"
        />
        <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
          <ToggleSwitch
            label="Show Email"
            checked={privacy.showEmail}
            onChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
            description="Display your email address on your profile"
          />
          <ToggleSwitch
            label="Show Phone"
            checked={privacy.showPhone}
            onChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
            description="Display your phone number on your profile"
          />
          <ToggleSwitch
            label="Allow Search"
            checked={privacy.allowSearch}
            onChange={(checked) => setPrivacy({ ...privacy, allowSearch: checked })}
            description="Allow others to find you through search"
          />
          <ToggleSwitch
            label="Data Sharing"
            checked={privacy.dataSharing}
            onChange={(checked) => setPrivacy({ ...privacy, dataSharing: checked })}
            description="Share anonymized data for product improvement"
          />
          <ToggleSwitch
            label="Analytics Tracking"
            checked={privacy.analyticsTracking}
            onChange={(checked) =>
              setPrivacy({ ...privacy, analyticsTracking: checked })
            }
            description="Allow analytics tracking for better experience"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div role="tabpanel" id="panel-appearance" aria-labelledby="tab-appearance">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Appearance Settings
      </h2>
      <div className="space-y-4">
        <FormSelect
          label="Theme"
          value={appearance.theme}
          onChange={(value) =>
            setAppearance({ ...appearance, theme: value as any })
          }
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          description="Choose your preferred theme"
        />
        <FormSelect
          label="Font Size"
          value={appearance.fontSize}
          onChange={(value) =>
            setAppearance({ ...appearance, fontSize: value as any })
          }
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
          description="Adjust the font size for better readability"
        />
        <FormSelect
          label="Language"
          value={appearance.language}
          onChange={(value) => setAppearance({ ...appearance, language: value })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'zh', label: 'Chinese' },
            { value: 'ja', label: 'Japanese' },
          ]}
          description="Select your preferred language"
        />
        <FormSelect
          label="Timezone"
          value={appearance.timezone}
          onChange={(value) => setAppearance({ ...appearance, timezone: value })}
          options={[
            { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
            { value: 'America/New_York', label: 'Eastern Time (ET)' },
            { value: 'America/Chicago', label: 'Central Time (CT)' },
            { value: 'America/Denver', label: 'Mountain Time (MT)' },
            { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
            { value: 'Europe/London', label: 'London (GMT)' },
            { value: 'Europe/Paris', label: 'Paris (CET)' },
            { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
            { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
          ]}
          description="Set your timezone for accurate time display"
        />
        <FormSelect
          label="Date Format"
          value={appearance.dateFormat}
          onChange={(value) =>
            setAppearance({ ...appearance, dateFormat: value as any })
          }
          options={[
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
          ]}
          description="Choose your preferred date format"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="min-h-[400px]">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'appearance' && renderAppearanceTab()}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          onClick={handleCancel}
          disabled={!hasChanges}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

