import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Post, Comment, Notification, User, ReactionRecord, ReactionType, CommRequest, CitizenUser, OrganizationUser } from '../types';
import { seedPosts, seedComments, seedNotifications, seedCitizens, seedOrganizations, seedReactions, seedCommRequests } from '../data/seed';

const STORAGE_KEY = 'civix_state_v1';

interface AppState {
  users: User[];
  currentUserId: string | null;
  posts: Post[];
  comments: Comment[];
  reactions: ReactionRecord[];
  notifications: Notification[];
  commRequests: CommRequest[];
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return parsed;
    }
  } catch {
    // ignore
  }
  return {
    users: [...seedCitizens, ...seedOrganizations],
    currentUserId: null,
    posts: seedPosts,
    comments: seedComments,
    reactions: seedReactions,
    notifications: seedNotifications,
    commRequests: seedCommRequests,
  };
}

interface StoreContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => User | null;
  loginDemo: (role: 'citizen' | 'organization') => void;
  logout: () => void;
  registerCitizen: (data: Omit<CitizenUser, 'id' | 'role' | 'createdAt' | 'privacy' | 'orgCommunication'> & { privacy?: 'private' | 'public'; orgCommunication?: 'ask' | 'allow' | 'deny' }) => CitizenUser;
  registerOrganization: (data: Omit<OrganizationUser, 'id' | 'role' | 'createdAt' | 'verified'>) => OrganizationUser;
  // Posts
  createPost: (data: Partial<Post>) => Post;
  getPost: (id: string) => Post | undefined;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  // Reactions
  getReaction: (userId: string, postId: string) => ReactionType | null;
  setReaction: (userId: string, postId: string, reaction: ReactionType) => void;
  removeReaction: (userId: string, postId: string) => void;
  getReactionCounts: (postId: string) => { support: number; sameIssue: number; downvote: number };
  // Comments
  addComment: (postId: string, text: string, isOfficial: boolean) => void;
  getComments: (postId: string) => Comment[];
  // Notifications
  getNotifications: (userId: string) => Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  // Communication requests
  getCommRequests: (citizenId: string) => CommRequest[];
  requestCommunication: (orgId: string, orgName: string, citizenId: string, citizenName: string, postId: string, postTitle: string, reason: string) => void;
  respondCommRequest: (id: string, status: 'allowed' | 'declined') => void;
  getCommRequestsForOrg: (orgId: string) => CommRequest[];
  getCommRequestByOrgAndCitizen: (orgId: string, citizenId: string) => CommRequest | undefined;
  updateCitizen: (id: string, updates: Partial<CitizenUser>) => void;
  // All posts
  getAllPosts: () => Post[];
  // Helpers
  getUser: (id: string) => User | undefined;
  getOrganization: (id: string) => OrganizationUser | undefined;
  getOrganizations: () => OrganizationUser[];
  getCitizen: (id: string) => CitizenUser | undefined;
}

const StoreContext = createContext<StoreContextType | null>(null);

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = state.currentUserId ? state.users.find((u) => u.id === state.currentUserId) ?? null : null;

  const login = useCallback((email: string, password: string): User | null => {
    const user = state.users.find((u) => u.email === email && u.password === password);
    if (user) {
      setState((s) => ({ ...s, currentUserId: user.id }));
      return user;
    }
    return null;
  }, [state.users]);

  const loginDemo = useCallback((role: 'citizen' | 'organization') => {
    const demo = state.users.find((u) => u.role === role && (role === 'citizen' ? u.id === 'c-demo' : u.id === 'o-demo'));
    if (demo) {
      setState((s) => ({ ...s, currentUserId: demo.id }));
    }
  }, [state.users]);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: null }));
  }, []);

  const registerCitizen = useCallback((data: Omit<CitizenUser, 'id' | 'role' | 'createdAt' | 'privacy' | 'orgCommunication'> & { privacy?: 'private' | 'public'; orgCommunication?: 'ask' | 'allow' | 'deny' }): CitizenUser => {
    const newUser: CitizenUser = {
      id: uid('c'),
      role: 'citizen',
      name: data.name,
      email: data.email,
      password: data.password,
      locality: data.locality,
      photo: data.photo,
      privacy: data.privacy ?? 'private',
      orgCommunication: data.orgCommunication ?? 'ask',
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, users: [...s.users, newUser], currentUserId: newUser.id }));
    return newUser;
  }, []);

  const registerOrganization = useCallback((data: Omit<OrganizationUser, 'id' | 'role' | 'createdAt' | 'verified'>): OrganizationUser => {
    const newUser: OrganizationUser = {
      id: uid('o'),
      role: 'organization',
      orgName: data.orgName,
      orgType: data.orgType,
      email: data.email,
      password: data.password,
      contactPerson: data.contactPerson,
      serviceArea: data.serviceArea,
      description: data.description,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, users: [...s.users, newUser], currentUserId: newUser.id }));
    return newUser;
  }, []);

  const createPost = useCallback((data: Partial<Post>): Post => {
    const post: Post = {
      id: uid('p'),
      type: data.type ?? 'Issue',
      category: data.category,
      title: data.title ?? '',
      description: data.description ?? '',
      locality: data.locality ?? '',
      lat: data.lat,
      lng: data.lng,
      image: data.image,
      authorId: data.authorId ?? '',
      authorName: data.authorName ?? '',
      authorLocality: data.authorLocality,
      status: data.status ?? 'Reported',
      createdAt: new Date().toISOString(),
      date: data.date,
      time: data.time,
      interestedCount: data.interestedCount ?? 0,
      joinedCount: data.joinedCount ?? 0,
      feedbackYes: 0,
      feedbackNo: 0,
    };
    setState((s) => ({ ...s, posts: [post, ...s.posts] }));
    return post;
  }, []);

  const getPost = useCallback((id: string) => state.posts.find((p) => p.id === id), [state.posts]);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const getReaction = useCallback((userId: string, postId: string): ReactionType | null => {
    const r = state.reactions.find((r) => r.userId === userId && r.postId === postId);
    return r ? r.reaction : null;
  }, [state.reactions]);

  const setReaction = useCallback((userId: string, postId: string, reaction: ReactionType) => {
    setState((s) => {
      const existing = s.reactions.find((r) => r.userId === userId && r.postId === postId);
      if (existing) {
        return s;
      }
      return { ...s, reactions: [...s.reactions, { userId, postId, reaction }] };
    });
  }, []);

  const removeReaction = useCallback((userId: string, postId: string) => {
    setState((s) => ({
      ...s,
      reactions: s.reactions.filter((r) => !(r.userId === userId && r.postId === postId)),
    }));
  }, []);

  const getReactionCounts = useCallback((postId: string) => {
    const postReactions = state.reactions.filter((r) => r.postId === postId);
    return {
      support: postReactions.filter((r) => r.reaction === 'support').length,
      sameIssue: postReactions.filter((r) => r.reaction === 'same_issue').length,
      downvote: postReactions.filter((r) => r.reaction === 'downvote').length,
    };
  }, [state.reactions]);

  const addComment = useCallback((postId: string, text: string, isOfficial: boolean) => {
    if (!currentUser) return;
    const comment: Comment = {
      id: uid('cm'),
      postId,
      authorId: currentUser.id,
      authorName: currentUser.role === 'organization' ? currentUser.orgName : currentUser.name,
      authorRole: currentUser.role,
      text,
      isOfficial,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, comments: [...s.comments, comment] }));
  }, [currentUser]);

  const getComments = useCallback((postId: string) => {
    return state.comments
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [state.comments]);

  const getNotifications = useCallback((userId: string) => {
    return state.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.notifications]);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const notification: Notification = {
      ...n,
      id: uid('n'),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setState((s) => ({ ...s, notifications: [notification, ...s.notifications] }));
  }, []);

  const getCommRequests = useCallback((citizenId: string) => {
    return state.commRequests
      .filter((cr) => cr.citizenId === citizenId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.commRequests]);

  const requestCommunication = useCallback((orgId: string, orgName: string, citizenId: string, citizenName: string, postId: string, postTitle: string, reason: string) => {
    const req: CommRequest = {
      id: uid('cr'),
      orgId,
      orgName,
      citizenId,
      citizenName,
      postId,
      postTitle,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, commRequests: [...s.commRequests, req] }));
  }, []);

  const respondCommRequest = useCallback((id: string, status: 'allowed' | 'declined') => {
    setState((s) => ({
      ...s,
      commRequests: s.commRequests.map((cr) => (cr.id === id ? { ...cr, status } : cr)),
    }));
  }, []);

  const getCommRequestsForOrg = useCallback((orgId: string) => {
    return state.commRequests
      .filter((cr) => cr.orgId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.commRequests]);

  const getCommRequestByOrgAndCitizen = useCallback((orgId: string, citizenId: string) => {
    return state.commRequests.find((cr) => cr.orgId === orgId && cr.citizenId === citizenId);
  }, [state.commRequests]);

  const updateCitizen = useCallback((id: string, updates: Partial<CitizenUser>) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id && u.role === 'citizen' ? { ...u, ...updates } as CitizenUser : u)),
    }));
  }, []);

  const getAllPosts = useCallback(() => state.posts, [state.posts]);

  const deletePost = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      posts: s.posts.filter((p) => p.id !== id),
      comments: s.comments.filter((c) => c.postId !== id),
      reactions: s.reactions.filter((r) => r.postId !== id),
      notifications: s.notifications.filter((n) => n.postId !== id),
    }));
  }, []);

  const getUser = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const getOrganization = useCallback((id: string) => state.users.find((u) => u.id === id && u.role === 'organization') as OrganizationUser | undefined, [state.users]);
  const getOrganizations = useCallback(() => state.users.filter((u) => u.role === 'organization') as OrganizationUser[], [state.users]);
  const getCitizen = useCallback((id: string) => state.users.find((u) => u.id === id && u.role === 'citizen') as CitizenUser | undefined, [state.users]);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        login,
        loginDemo,
        logout,
        registerCitizen,
        registerOrganization,
        createPost,
        getPost,
        updatePost,
        deletePost,
        getReaction,
        setReaction,
        removeReaction,
        getReactionCounts,
        addComment,
        getComments,
        getNotifications,
        markNotificationRead,
        addNotification,
        getCommRequests,
        requestCommunication,
        respondCommRequest,
        getCommRequestsForOrg,
        getCommRequestByOrgAndCitizen,
        updateCitizen,
        getAllPosts,
        getUser,
        getOrganization,
        getOrganizations,
        getCitizen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
