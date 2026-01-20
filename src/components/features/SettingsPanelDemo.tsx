import { useState } from 'react';
import { SettingsPanel } from '../layout/SettingsPanel';
import type {
  ProfileSettings,
  NotificationSettings,
  PrivacySettings,
  AppearanceSettings,
} from '../../types/settings.types';

export const SettingsPanelDemo = () => {
  const [savedData, setSavedData] = useState<{
    profile?: ProfileSettings;
    notifications?: NotificationSettings;
    privacy?: PrivacySettings;
    appearance?: AppearanceSettings;
  }>({});

  const initialProfile: ProfileSettings = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Software engineer passionate about creating great user experiences.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
  };

  const initialNotifications: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    weeklyDigest: false,
    marketingEmails: false,
  };

  const initialPrivacy: PrivacySettings = {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowSearch: true,
    dataSharing: false,
    analyticsTracking: true,
  };

  const initialAppearance: AppearanceSettings = {
    theme: 'system',
    fontSize: 'medium',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
  };

  const handleSave = (tab: string, data: any) => {
    console.log(`Saving ${tab}:`, data);
    setSavedData((prev) => ({
      ...prev,
      [tab]: data,
    }));
    
    // Show success message (in a real app, you'd use a toast notification)
    alert(`${tab.charAt(0).toUpperCase() + tab.slice(1)} settings saved successfully!`);
  };

  const handleCancel = () => {
    console.log('Settings cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <SettingsPanel
        profile={savedData.profile || initialProfile}
        notifications={savedData.notifications || initialNotifications}
        privacy={savedData.privacy || initialPrivacy}
        appearance={savedData.appearance || initialAppearance}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

