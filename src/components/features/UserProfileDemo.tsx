import { UserProfile } from './UserProfile';
import type { UserProfile as UserProfileType } from '../../types/user.types';

const sampleUsers: UserProfileType[] = [
  {
    id: '1',
    username: 'johndoe',
    displayName: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
    bio: 'Software engineer passionate about creating beautiful user experiences. 🚀\n\nLover of coffee, code, and cats.',
    stats: {
      followers: 12500,
      following: 342,
      posts: 156,
    },
    isFollowing: false,
    isOwnProfile: false,
    isVerified: true,
  },
  {
    id: '2',
    username: 'janedoe',
    displayName: 'Jane Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JaneDoe',
    bio: 'UX Designer | Building the future of digital experiences ✨\n\nCurrently working on amazing projects that push the boundaries of design.',
    stats: {
      followers: 8500,
      following: 521,
      posts: 203,
    },
    isOwnProfile: true,
    isVerified: false,
  },
  {
    id: '3',
    username: 'alexsmith',
    displayName: 'Alex Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexSmith',
    bio: 'Photographer 📸 | Travel enthusiast ✈️ | Sharing moments from around the world',
    stats: {
      followers: 342000,
      following: 89,
      posts: 1247,
    },
    isFollowing: true,
    isOwnProfile: false,
    isVerified: true,
  },
  {
    id: '4',
    username: 'techguru',
    displayName: 'Tech Guru',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru',
    bio: 'Tech blogger | Early adopter | Breaking down complex tech into simple terms',
    stats: {
      followers: 23400,
      following: 1234,
      posts: 567,
    },
    isFollowing: false,
    isOwnProfile: false,
    isVerified: false,
  },
  {
    id: '5',
    username: 'artlover',
    displayName: 'Samantha Art',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samantha',
    bio: 'Digital artist creating colorful worlds 🎨\nCheck out my latest collection!',
    stats: {
      followers: 5600,
      following: 234,
      posts: 89,
    },
    isFollowing: false,
    isOwnProfile: false,
    isVerified: false,
  },
  {
    id: '6',
    username: 'fitnesspro',
    displayName: 'Mike Fitness',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MikeFitness',
    bio: 'Fitness coach 💪 | Helping you achieve your goals one workout at a time\n\n📧 Contact for personalized training programs',
    stats: {
      followers: 156000,
      following: 456,
      posts: 892,
    },
    isFollowing: true,
    isOwnProfile: false,
    isVerified: true,
  },
];

export const UserProfileDemo = () => {
  const handleFollow = async (userId: string) => {
    console.log(`Following user: ${userId}`);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleUnfollow = async (userId: string) => {
    console.log(`Unfollowing user: ${userId}`);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleMessage = (userId: string) => {
    console.log(`Opening message thread with user: ${userId}`);
    // In a real app, this would navigate to messages or open a modal
  };

  const handleEditProfile = () => {
    console.log('Opening edit profile modal');
    // In a real app, this would open an edit profile modal
    alert('Edit profile functionality would open here');
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            User Profile Component Demo
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing the UserProfile component with various user scenarios
          </p>
        </header>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {sampleUsers.map((user, index) => (
            <div key={user.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <UserProfile
                user={user}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onMessage={handleMessage}
                onEditProfile={handleEditProfile}
              />
            </div>
          ))}
        </div>

        {/* Info Section */}
        <section className="mt-16 bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">✅ Included Features</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• User avatar with verified badge</li>
                <li>• Display name and username</li>
                <li>• Multi-line bio support</li>
                <li>• Formatted stats (K/M notation)</li>
                <li>• Follow/Following toggle</li>
                <li>• Message button</li>
                <li>• Edit profile (own profile)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">✅ Technical Features</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Fully responsive design</li>
                <li>• Accessible (ARIA labels, keyboard nav)</li>
                <li>• TypeScript typed</li>
                <li>• Loading states</li>
                <li>• Smooth transitions</li>
                <li>• Mobile-first approach</li>
                <li>• Tailwind CSS styling</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
