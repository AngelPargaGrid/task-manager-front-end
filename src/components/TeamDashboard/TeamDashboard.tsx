import React, { useState, useCallback } from 'react';
import { ProjectOverview } from './ProjectOverview';
import { TeamMembers } from './TeamMembers';
import { ProgressChart } from './ProgressChart';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import type { Project, ProjectMetric } from '../types/project';
import type { TeamMember } from '../types/team';
import type { Activity, ActivityType } from '../types/activity';
import type { Milestone } from '../types/project';

const initialProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    status: 'active',
    progress: 75,
    totalTasks: 12,
    completedTasks: 9,
    metrics: [],
  },
  {
    id: 'p2',
    name: 'Mobile App',
    status: 'active',
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    metrics: [],
  },
  {
    id: 'p3',
    name: 'API Integration',
    status: 'planning',
    progress: 10,
    totalTasks: 8,
    completedTasks: 0,
    metrics: [],
  },
];

const initialMetrics: ProjectMetric[] = [
  { label: 'Active Projects', value: 3, trend: 'neutral' },
  { label: 'Total Tasks', value: 40, trend: 'up', trendValue: '+5' },
  { label: 'Completed', value: 18, trend: 'up', trendValue: '+3' },
  { label: 'Team Size', value: 5, trend: 'up', trendValue: '+1' },
];

const initialTeam: TeamMember[] = [
  {
    id: 'm1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'owner',
    isOnline: true,
  },
  {
    id: 'm2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    role: 'admin',
    isOnline: true,
  },
  {
    id: 'm3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    role: 'member',
    isOnline: false,
  },
  {
    id: 'm4',
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    role: 'member',
    isOnline: true,
  },
  {
    id: 'm5',
    name: 'Aisha Patel',
    email: 'aisha@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    role: 'member',
    isOnline: false,
  },
];

const initialActivities: Activity[] = [
  {
    id: 'a1',
    type: 'task_completed',
    message: 'Completed "Design homepage mockup"',
    userId: 'm1',
    userName: 'Sarah Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'a2',
    type: 'member_added',
    message: 'Added James Wilson to the team',
    userId: 'm1',
    userName: 'Sarah Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a3',
    type: 'meeting_scheduled',
    message: 'Scheduled sprint planning for next Monday',
    userId: 'm2',
    userName: 'Marcus Johnson',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

const initialMilestones: Milestone[] = [
  { id: 'ms1', title: 'Design Phase', dueDate: 'Mar 15', completed: true, progress: 100 },
  { id: 'ms2', title: 'Development', dueDate: 'Apr 30', completed: false, progress: 60 },
  { id: 'ms3', title: 'Launch', dueDate: 'May 15', completed: false, progress: 0 },
];

function addActivity(
  activities: Activity[],
  type: ActivityType,
  message: string,
  user: TeamMember
): Activity[] {
  const newActivity: Activity = {
    id: `a${Date.now()}`,
    type,
    message,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    timestamp: new Date().toISOString(),
  };
  return [newActivity, ...activities];
}

export const TeamDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [metrics, setMetrics] = useState<ProjectMetric[]>(initialMetrics);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeam);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [milestones] = useState<Milestone[]>(initialMilestones);

  const handleCompleteTask = useCallback((projectId: string) => {
    let projectName: string | null = null;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        projectName = p.name;
        const completed = Math.min(p.completedTasks + 1, p.totalTasks);
        const progress = Math.round((completed / p.totalTasks) * 100);
        return { ...p, completedTasks: completed, progress };
      })
    );
    setMetrics((prev) =>
      prev.map((m) =>
        m.label === 'Completed'
          ? { ...m, value: (m.value as number) + 1, trend: 'up' as const, trendValue: `+1` }
          : m
      )
    );
    const user = teamMembers[0];
    if (projectName && user) {
      setActivities((a) =>
        addActivity(a, 'task_completed', `Completed a task in "${projectName}"`, user)
      );
    }
  }, [teamMembers]);

  const handleAddTeamMember = useCallback(() => {
    const newMember: TeamMember = {
      id: `m${Date.now()}`,
      name: `New Member ${teamMembers.length + 1}`,
      email: `newmember${teamMembers.length + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      role: 'member',
      isOnline: true,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setMetrics((prev) =>
      prev.map((m) =>
        m.label === 'Team Size'
          ? { ...m, value: (m.value as number) + 1, trend: 'up' as const, trendValue: `+1` }
          : m
      )
    );
    const user = teamMembers[0];
    setActivities((a) =>
      addActivity(a, 'member_added', `Added ${newMember.name} to the team`, user)
    );
  }, [teamMembers]);

  const handleCreateTask = useCallback(() => {
    const project = projects[0];
    if (project) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                totalTasks: p.totalTasks + 1,
                progress: Math.round((p.completedTasks / (p.totalTasks + 1)) * 100),
              }
            : p
        )
      );
      setMetrics((prev) =>
        prev.map((m) =>
          m.label === 'Total Tasks'
            ? { ...m, value: (m.value as number) + 1 }
            : m
        )
      );
      const user = teamMembers[0];
      setActivities((a) =>
        addActivity(a, 'task_created', `Created new task in "${project.name}"`, user)
      );
    }
  }, [projects, teamMembers]);

  const handleGenerateReport = useCallback(() => {
    const user = teamMembers[0];
    setActivities((a) =>
      addActivity(a, 'report_generated', 'Generated project status report', user)
    );
  }, [teamMembers]);

  const handleScheduleMeeting = useCallback(() => {
    const user = teamMembers[0];
    setActivities((a) =>
      addActivity(
        a,
        'meeting_scheduled',
        'Scheduled team sync for tomorrow 2pm',
        user
      )
    );
  }, [teamMembers]);

  const handleContact = useCallback((_memberId: string) => {
    console.log('Contact member:', _memberId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Management Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Team collaboration and project overview
          </p>
        </header>

        <div className="space-y-8">
          <QuickActions
            onCreateTask={handleCreateTask}
            onAddMember={handleAddTeamMember}
            onGenerateReport={handleGenerateReport}
            onScheduleMeeting={handleScheduleMeeting}
          />

          <ProjectOverview
            projects={projects}
            metrics={metrics}
            onCompleteTask={handleCompleteTask}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
              <ProgressChart
                projects={projects}
                milestones={milestones}
              />
            </div>

            <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
              <TeamMembers
                members={teamMembers}
                onContact={handleContact}
                onAddMember={handleAddTeamMember}
              />
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
