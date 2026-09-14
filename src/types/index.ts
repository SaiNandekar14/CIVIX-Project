export type Role = 'citizen' | 'organization';

export type IssueCategory =
  | 'Road Damage'
  | 'Streetlight'
  | 'Water Supply'
  | 'Garbage'
  | 'Drainage'
  | 'Traffic'
  | 'Public Transport'
  | 'Footpath'
  | 'Electricity'
  | 'Other';

export type IssueStatus =
  | 'Reported'
  | 'Community Attention'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolution Submitted'
  | 'Community Feedback'
  | 'Resolved';

export type PostType = 'Issue' | 'Event' | 'Community Initiative' | 'Announcement' | 'Civic Discussion' | 'Community Update';

export type ReactionType = 'same_issue' | 'support' | 'downvote';

export interface CitizenUser {
  id: string;
  role: 'citizen';
  name: string;
  email: string;
  password: string;
  locality: string;
  photo?: string;
  privacy: 'private' | 'public';
  orgCommunication: 'ask' | 'allow' | 'deny';
  createdAt: string;
}

export interface OrganizationUser {
  id: string;
  role: 'organization';
  orgName: string;
  orgType: string;
  email: string;
  password: string;
  contactPerson: string;
  serviceArea: string;
  description: string;
  verified: boolean;
  createdAt: string;
}

export type User = CitizenUser | OrganizationUser;

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  isOfficial: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  type: PostType;
  category?: IssueCategory;
  title: string;
  description: string;
  locality: string;
  lat?: number;
  lng?: number;
  image?: string;
  authorId: string;
  authorName: string;
  authorLocality?: string;
  status: IssueStatus;
  createdAt: string;
  // Event/initiative fields
  date?: string;
  time?: string;
  interestedCount?: number;
  joinedCount?: number;
  // Resolution
  resolutionDescription?: string;
  resolutionDate?: string;
  resolutionImage?: string;
  // Community feedback
  feedbackYes?: number;
  feedbackNo?: number;
  assignedOrgId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  type: 'reaction' | 'organization' | 'status' | 'resolution' | 'feedback' | 'communication';
  postId?: string;
  orgId?: string;
  read: boolean;
  createdAt: string;
}

export interface ReactionRecord {
  userId: string;
  postId: string;
  reaction: ReactionType;
}

export interface CommRequest {
  id: string;
  orgId: string;
  orgName: string;
  citizenId: string;
  citizenName: string;
  postId: string;
  postTitle: string;
  reason: string;
  status: 'pending' | 'allowed' | 'declined';
  createdAt: string;
}
