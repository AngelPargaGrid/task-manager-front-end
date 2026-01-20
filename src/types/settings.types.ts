export type SettingsTab = 'profile' | 'notifications' | 'privacy' | 'appearance';

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowSearch: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
}

export interface SettingsPanelProps {
  profile?: ProfileSettings;
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
  appearance?: AppearanceSettings;
  onSave?: (tab: SettingsTab, data: any) => void;
  onCancel?: () => void;
}

