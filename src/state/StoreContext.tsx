import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Post, Comment, Notification, User, ReactionRecord, ReactionType, CommRequest, CitizenUser, OrganizationUser } from '../types';
import { supabase } from '../lib/supabase';

// ============================================
// Types matching DB rows
// ============================================

interface DbUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  locality: string | null;
  photo: string | null;
  privacy: string;
  org_communication: string;
  created_at: string;
}

interface DbOrganization {
  id: string;
  org_name: string;
  org_type: string;
  category: string | null;
  email: string;
  password: string;
  contact_person: string | null;
  service_area: string | null;
  description: string | null;
  verified: boolean;
  public_profile: Record<string, unknown> | null;
  created_at: string;
}

interface DbIssue {
  id: string;
  user_id: string;
  org_id: string | null;
  category: string;
  title: string;
  description: string;
  status: string;
  status_detail: string;
  locality: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  author_name: string;
  author_locality: string | null;
  date: string | null;
  time: string | null;
  interested_count: number;
  joined_count: number;
  feedback_yes: number;
  feedback_no: number;
  resolution_description: string | null;
  resolution_date: string | null;
  resolution_image: string | null;
  created_at: string;
}

interface DbOrgPost {
  id: string;
  org_id: string;
  type: string;
  title: string;
  body: string;
  locality: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  date: string | null;
  time: string | null;
  interested_count: number;
  joined_count: number;
  created_at: string;
}

interface DbReaction {
  id: string;
  issue_id: string;
  user_id: string;
  type: ReactionType;
  created_at: string;
}

interface DbComment {
  id: string;
  issue_id: string;
  user_id: string;
  author_name: string;
  author_role: string;
  text: string;
  is_official: boolean;
  created_at: string;
}

interface DbNotification {
  id: string;
  user_id: string;
  text: string;
  type: string;
  post_id: string | null;
  org_id: string | null;
  read: boolean;
  created_at: string;
}

interface DbCommRequest {
  id: string;
  org_id: string;
  user_id: string;
  org_name: string;
  citizen_name: string;
  post_id: string | null;
  post_title: string | null;
  reason: string | null;
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  resolved_at: string | null;
}

// ============================================
// App state (local cache of DB data)
// ============================================

interface AppState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  reactions: ReactionRecord[];
  notifications: Notification[];
  commRequests: CommRequest[];
  currentUserId: string | null;
  loaded: boolean;
}

// ============================================
// Store interface (same as before)
// ============================================

interface StoreContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginDemo: (role: 'citizen' | 'organization') => Promise<void>;
  logout: () => void;
  registerCitizen: (data: Omit<CitizenUser, 'id' | 'role' | 'createdAt' | 'privacy' | 'orgCommunication'> & { privacy?: 'private' | 'public'; orgCommunication?: 'ask' | 'allow' | 'deny' }) => Promise<CitizenUser>;
  registerOrganization: (data: Omit<OrganizationUser, 'id' | 'role' | 'createdAt' | 'verified'>) => Promise<OrganizationUser>;
  createPost: (data: Partial<Post>) => Promise<Post>;
  getPost: (id: string) => Post | undefined;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  getReaction: (userId: string, postId: string) => ReactionType | null;
  setReaction: (userId: string, postId: string, reaction: ReactionType) => Promise<void>;
  removeReaction: (userId: string, postId: string) => Promise<void>;
  getReactionCounts: (postId: string) => { support: number; sameIssue: number; downvote: number };
  addComment: (postId: string, text: string, isOfficial: boolean) => Promise<void>;
  getComments: (postId: string) => Comment[];
  getNotifications: (userId: string) => Notification[];
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  getCommRequests: (citizenId: string) => CommRequest[];
  requestCommunication: (orgId: string, orgName: string, citizenId: string, citizenName: string, postId: string, postTitle: string, reason: string) => Promise<void>;
  respondCommRequest: (id: string, status: 'allowed' | 'declined') => Promise<void>;
  getCommRequestsForOrg: (orgId: string) => CommRequest[];
  getCommRequestByOrgAndCitizen: (orgId: string, citizenId: string) => CommRequest | undefined;
  updateCitizen: (id: string, updates: Partial<CitizenUser>) => Promise<void>;
  getAllPosts: () => Post[];
  getUser: (id: string) => User | undefined;
  getOrganization: (id: string) => OrganizationUser | undefined;
  getOrganizations: () => OrganizationUser[];
  getCitizen: (id: string) => CitizenUser | undefined;
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// ============================================
// Mapping helpers: DB rows -> app types
// ============================================

function mapStatusDetailToEnum(detail: string): 'open' | 'in_progress' | 'resolved' {
  if (detail === 'Resolved') return 'resolved';
  if (['In Progress', 'Resolution Submitted', 'Community Feedback', 'Verified', 'Assigned'].includes(detail)) return 'in_progress';
  return 'open';
}

function mapDbUserToCitizen(u: DbUser): CitizenUser {
  return {
    id: u.id,
    role: 'citizen',
    name: u.name,
    email: u.email,
    password: u.password,
    locality: u.locality ?? '',
    photo: u.photo ?? undefined,
    privacy: u.privacy as 'private' | 'public',
    orgCommunication: u.org_communication as 'ask' | 'allow' | 'deny',
    createdAt: u.created_at,
  };
}

function mapDbOrgToUser(o: DbOrganization): OrganizationUser {
  return {
    id: o.id,
    role: 'organization',
    orgName: o.org_name,
    orgType: o.org_type,
    email: o.email,
    password: o.password,
    contactPerson: o.contact_person ?? '',
    serviceArea: o.service_area ?? '',
    description: o.description ?? '',
    verified: o.verified,
    createdAt: o.created_at,
  };
}

function mapDbIssueToPost(i: DbIssue): Post {
  return {
    id: i.id,
    type: 'Issue',
    category: i.category as Post['category'],
    title: i.title,
    description: i.description,
    locality: i.locality ?? '',
    lat: i.lat ?? undefined,
    lng: i.lng ?? undefined,
    image: i.image_url ?? undefined,
    authorId: i.user_id,
    authorName: i.author_name,
    authorLocality: i.author_locality ?? undefined,
    status: i.status_detail as Post['status'],
    createdAt: i.created_at,
    date: i.date ?? undefined,
    time: i.time ?? undefined,
    interestedCount: i.interested_count,
    joinedCount: i.joined_count,
    feedbackYes: i.feedback_yes,
    feedbackNo: i.feedback_no,
    resolutionDescription: i.resolution_description ?? undefined,
    resolutionDate: i.resolution_date ?? undefined,
    resolutionImage: i.resolution_image ?? undefined,
    assignedOrgId: i.org_id ?? undefined,
  };
}

function mapDbOrgPostToPost(p: DbOrgPost): Post {
  const typeMap: Record<string, Post['type']> = {
    announcement: 'Announcement',
    initiative: 'Community Initiative',
    event: 'Event',
    update: 'Community Update',
  };
  return {
    id: p.id,
    type: typeMap[p.type] ?? 'Announcement',
    title: p.title,
    description: p.body,
    locality: p.locality ?? '',
    lat: p.lat ?? undefined,
    lng: p.lng ?? undefined,
    image: p.image_url ?? undefined,
    authorId: p.org_id,
    authorName: '',
    status: 'Reported',
    createdAt: p.created_at,
    date: p.date ?? undefined,
    time: p.time ?? undefined,
    interestedCount: p.interested_count,
    joinedCount: p.joined_count,
  };
}

function mapDbReaction(r: DbReaction): ReactionRecord {
  return { userId: r.user_id, postId: r.issue_id, reaction: r.type };
}

function mapDbComment(c: DbComment): Comment {
  return {
    id: c.id,
    postId: c.issue_id,
    authorId: c.user_id,
    authorName: c.author_name,
    authorRole: c.author_role as Comment['authorRole'],
    text: c.text,
    isOfficial: c.is_official,
    createdAt: c.created_at,
  };
}

function mapDbNotification(n: DbNotification): Notification {
  return {
    id: n.id,
    userId: n.user_id,
    text: n.text,
    type: n.type as Notification['type'],
    postId: n.post_id ?? undefined,
    orgId: n.org_id ?? undefined,
    read: n.read,
    createdAt: n.created_at,
  };
}

function mapDbCommRequest(cr: DbCommRequest): CommRequest {
  return {
    id: cr.id,
    orgId: cr.org_id,
    orgName: cr.org_name,
    citizenId: cr.user_id,
    citizenName: cr.citizen_name,
    postId: cr.post_id ?? '',
    postTitle: cr.post_title ?? '',
    reason: cr.reason ?? '',
    status: cr.status === 'accepted' ? 'allowed' : cr.status === 'denied' ? 'declined' : 'pending',
    createdAt: cr.created_at,
  };
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================
// Provider
// ============================================

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    users: [],
    posts: [],
    comments: [],
    reactions: [],
    notifications: [],
    commRequests: [],
    currentUserId: null,
    loaded: false,
  });

  const loadAll = useCallback(async () => {
    const [usersRes, orgsRes, issuesRes, orgPostsRes, reactionsRes, commentsRes, notificationsRes, commReqRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('organizations').select('*'),
      supabase.from('issues').select('*').order('created_at', { ascending: false }),
      supabase.from('org_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('reactions').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('communication_requests').select('*').order('created_at', { ascending: false }),
    ]);

    const citizens = (usersRes.data as DbUser[] | null ?? []).map(mapDbUserToCitizen);
    const orgs = (orgsRes.data as DbOrganization[] | null ?? []).map(mapDbOrgToUser);
    const issuePosts = (issuesRes.data as DbIssue[] | null ?? []).map(mapDbIssueToPost);
    const orgPosts = (orgPostsRes.data as DbOrgPost[] | null ?? []).map(mapDbOrgPostToPost);

    // Enrich org posts with author name
    const orgMap = new Map(orgs.map((o) => [o.id, o]));
    for (const p of orgPosts) {
      const org = orgMap.get(p.authorId);
      if (org) p.authorName = org.orgName;
    }

    setState({
      users: [...citizens, ...orgs],
      posts: [...issuePosts, ...orgPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      comments: (commentsRes.data as DbComment[] | null ?? []).map(mapDbComment),
      reactions: (reactionsRes.data as DbReaction[] | null ?? []).map(mapDbReaction),
      notifications: (notificationsRes.data as DbNotification[] | null ?? []).map(mapDbNotification),
      commRequests: (commReqRes.data as DbCommRequest[] | null ?? []).map(mapDbCommRequest),
      currentUserId: state.currentUserId,
      loaded: true,
    });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Restore session from sessionStorage
  useEffect(() => {
    const savedId = sessionStorage.getItem('civix_current_user');
    if (savedId) {
      setState((s) => ({ ...s, currentUserId: savedId }));
    }
  }, []);

  const currentUser = state.currentUserId ? state.users.find((u) => u.id === state.currentUserId) ?? null : null;

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    // Check citizens
    const { data: citizen } = await supabase.from('users').select('*').eq('email', email).eq('password', password).maybeSingle();
    if (citizen) {
      const u = mapDbUserToCitizen(citizen as DbUser);
      sessionStorage.setItem('civix_current_user', u.id);
      setState((s) => ({ ...s, currentUserId: u.id, users: s.users.some((x) => x.id === u.id) ? s.users : [...s.users, u] }));
      return u;
    }
    // Check organizations
    const { data: org } = await supabase.from('organizations').select('*').eq('email', email).eq('password', password).maybeSingle();
    if (org) {
      const o = mapDbOrgToUser(org as DbOrganization);
      sessionStorage.setItem('civix_current_user', o.id);
      setState((s) => ({ ...s, currentUserId: o.id, users: s.users.some((x) => x.id === o.id) ? s.users : [...s.users, o] }));
      return o;
    }
    return null;
  }, []);

  const loginDemo = useCallback(async (role: 'citizen' | 'organization') => {
    const id = role === 'citizen' ? 'c-demo' : 'o-demo';
    sessionStorage.setItem('civix_current_user', id);
    setState((s) => ({ ...s, currentUserId: id }));
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('civix_current_user');
    setState((s) => ({ ...s, currentUserId: null }));
  }, []);

  const registerCitizen = useCallback(async (data: Omit<CitizenUser, 'id' | 'role' | 'createdAt' | 'privacy' | 'orgCommunication'> & { privacy?: 'private' | 'public'; orgCommunication?: 'ask' | 'allow' | 'deny' }): Promise<CitizenUser> => {
    const id = uid('c');
    const insertData = {
      id,
      name: data.name,
      email: data.email,
      password: data.password,
      locality: data.locality,
      photo: data.photo ?? null,
      privacy: data.privacy ?? 'private',
      org_communication: data.orgCommunication ?? 'ask',
    };
    await supabase.from('users').insert(insertData);
    const newUser: CitizenUser = {
      id,
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
    sessionStorage.setItem('civix_current_user', id);
    setState((s) => ({ ...s, users: [...s.users, newUser], currentUserId: id }));
    return newUser;
  }, []);

  const registerOrganization = useCallback(async (data: Omit<OrganizationUser, 'id' | 'role' | 'createdAt' | 'verified'>): Promise<OrganizationUser> => {
    const id = uid('o');
    const insertData = {
      id,
      org_name: data.orgName,
      org_type: data.orgType,
      email: data.email,
      password: data.password,
      contact_person: data.contactPerson,
      service_area: data.serviceArea,
      description: data.description,
      verified: false,
    };
    await supabase.from('organizations').insert(insertData);
    const newUser: OrganizationUser = {
      id,
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
    sessionStorage.setItem('civix_current_user', id);
    setState((s) => ({ ...s, users: [...s.users, newUser], currentUserId: id }));
    return newUser;
  }, []);

  const createPost = useCallback(async (data: Partial<Post>): Promise<Post> => {
    const id = uid('p');
    const now = new Date().toISOString();
    const isIssue = data.type === 'Issue';

    if (isIssue) {
      const statusDetail = data.status ?? 'Reported';
      const insertData = {
        id,
        user_id: data.authorId ?? '',
        org_id: data.assignedOrgId ?? null,
        category: data.category ?? 'Other',
        title: data.title ?? '',
        description: data.description ?? '',
        status: mapStatusDetailToEnum(statusDetail),
        status_detail: statusDetail,
        locality: data.locality ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        image_url: data.image ?? null,
        author_name: data.authorName ?? '',
        author_locality: data.authorLocality ?? null,
        date: data.date ?? null,
        time: data.time ?? null,
        interested_count: data.interestedCount ?? 0,
        joined_count: data.joinedCount ?? 0,
        feedback_yes: 0,
        feedback_no: 0,
      };
      await supabase.from('issues').insert(insertData);
    } else {
      // Org post or citizen non-issue post
      const typeMap: Record<string, string> = {
        Announcement: 'announcement',
        'Community Initiative': 'initiative',
        Event: 'event',
        'Community Update': 'update',
      };
      const orgId = data.authorId ?? '';
      const insertData = {
        id,
        org_id: orgId,
        type: typeMap[data.type ?? 'Announcement'] ?? 'announcement',
        title: data.title ?? '',
        body: data.description ?? '',
        locality: data.locality ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        image_url: data.image ?? null,
        date: data.date ?? null,
        time: data.time ?? null,
        interested_count: data.interestedCount ?? 0,
        joined_count: data.joinedCount ?? 0,
      };
      await supabase.from('org_posts').insert(insertData);
    }

    const post: Post = {
      id,
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
      createdAt: now,
      date: data.date,
      time: data.time,
      interestedCount: data.interestedCount ?? 0,
      joinedCount: data.joinedCount ?? 0,
      feedbackYes: 0,
      feedbackNo: 0,
      assignedOrgId: data.assignedOrgId,
    };

    setState((s) => ({ ...s, posts: [post, ...s.posts] }));
    return post;
  }, []);

  const getPost = useCallback((id: string) => state.posts.find((p) => p.id === id), [state.posts]);

  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    // Find the post to know if it's an issue or org post
    const post = state.posts.find((p) => p.id === id);
    if (!post) return;

    if (post.type === 'Issue') {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.status) {
        dbUpdates.status_detail = updates.status;
        dbUpdates.status = mapStatusDetailToEnum(updates.status);
      }
      if (updates.assignedOrgId !== undefined) dbUpdates.org_id = updates.assignedOrgId ?? null;
      if (updates.resolutionDescription !== undefined) dbUpdates.resolution_description = updates.resolutionDescription;
      if (updates.resolutionDate !== undefined) dbUpdates.resolution_date = updates.resolutionDate;
      if (updates.resolutionImage !== undefined) dbUpdates.resolution_image = updates.resolutionImage;
      if (updates.feedbackYes !== undefined) dbUpdates.feedback_yes = updates.feedbackYes;
      if (updates.feedbackNo !== undefined) dbUpdates.feedback_no = updates.feedbackNo;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;

      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('issues').update(dbUpdates).eq('id', id);
      }
    } else {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.body = updates.description;
      if (updates.image !== undefined) dbUpdates.image_url = updates.image;
      if (updates.interestedCount !== undefined) dbUpdates.interested_count = updates.interestedCount;
      if (updates.joinedCount !== undefined) dbUpdates.joined_count = updates.joinedCount;

      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('org_posts').update(dbUpdates).eq('id', id);
      }
    }

    setState((s) => ({
      ...s,
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, [state.posts]);

  const deletePost = useCallback(async (id: string) => {
    const post = state.posts.find((p) => p.id === id);
    if (!post) return;

    if (post.type === 'Issue') {
      await supabase.from('issues').delete().eq('id', id);
    } else {
      await supabase.from('org_posts').delete().eq('id', id);
    }

    setState((s) => ({
      ...s,
      posts: s.posts.filter((p) => p.id !== id),
      comments: s.comments.filter((c) => c.postId !== id),
      reactions: s.reactions.filter((r) => r.postId !== id),
      notifications: s.notifications.filter((n) => n.postId !== id),
    }));
  }, [state.posts]);

  const getReaction = useCallback((userId: string, postId: string): ReactionType | null => {
    const r = state.reactions.find((r) => r.userId === userId && r.postId === postId);
    return r ? r.reaction : null;
  }, [state.reactions]);

  const setReaction = useCallback(async (userId: string, postId: string, reaction: ReactionType) => {
    const existing = state.reactions.find((r) => r.userId === userId && r.postId === postId);
    if (existing) return;

    await supabase.from('reactions').insert({ issue_id: postId, user_id: userId, type: reaction });

    setState((s) => ({
      ...s,
      reactions: [...s.reactions, { userId, postId, reaction }],
    }));
  }, [state.reactions]);

  const removeReaction = useCallback(async (userId: string, postId: string) => {
    await supabase.from('reactions').delete().eq('issue_id', postId).eq('user_id', userId);

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

  const addComment = useCallback(async (postId: string, text: string, isOfficial: boolean) => {
    if (!currentUser) return;
    const id = uid('cm');
    const now = new Date().toISOString();
    const authorName = currentUser.role === 'organization' ? currentUser.orgName : currentUser.name;

    await supabase.from('comments').insert({
      id,
      issue_id: postId,
      user_id: currentUser.id,
      author_name: authorName,
      author_role: currentUser.role,
      text,
      is_official: isOfficial,
    });

    const comment: Comment = {
      id,
      postId,
      authorId: currentUser.id,
      authorName,
      authorRole: currentUser.role,
      text,
      isOfficial,
      createdAt: now,
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

  const markNotificationRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const addNotification = useCallback(async (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const id = uid('n');
    const now = new Date().toISOString();

    await supabase.from('notifications').insert({
      id,
      user_id: n.userId,
      text: n.text,
      type: n.type,
      post_id: n.postId ?? null,
      org_id: n.orgId ?? null,
      read: false,
    });

    const notification: Notification = { ...n, id, createdAt: now, read: false };
    setState((s) => ({ ...s, notifications: [notification, ...s.notifications] }));
  }, []);

  const getCommRequests = useCallback((citizenId: string) => {
    return state.commRequests
      .filter((cr) => cr.citizenId === citizenId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.commRequests]);

  const requestCommunication = useCallback(async (orgId: string, orgName: string, citizenId: string, citizenName: string, postId: string, postTitle: string, reason: string) => {
    const id = uid('cr');
    const now = new Date().toISOString();

    await supabase.from('communication_requests').insert({
      id,
      org_id: orgId,
      user_id: citizenId,
      org_name: orgName,
      citizen_name: citizenName,
      post_id: postId,
      post_title: postTitle,
      reason,
      status: 'pending',
    });

    const req: CommRequest = {
      id, orgId, orgName, citizenId, citizenName, postId, postTitle, reason,
      status: 'pending', createdAt: now,
    };
    setState((s) => ({ ...s, commRequests: [...s.commRequests, req] }));
  }, []);

  const respondCommRequest = useCallback(async (id: string, status: 'allowed' | 'declined') => {
    const dbStatus = status === 'allowed' ? 'accepted' : 'denied';
    await supabase.from('communication_requests').update({
      status: dbStatus,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);

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

  const updateCitizen = useCallback(async (id: string, updates: Partial<CitizenUser>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.locality !== undefined) dbUpdates.locality = updates.locality;
    if (updates.photo !== undefined) dbUpdates.photo = updates.photo;
    if (updates.privacy !== undefined) dbUpdates.privacy = updates.privacy;
    if (updates.orgCommunication !== undefined) dbUpdates.org_communication = updates.orgCommunication;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('users').update(dbUpdates).eq('id', id);
    }

    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id && u.role === 'citizen' ? { ...u, ...updates } as CitizenUser : u)),
    }));
  }, []);

  const getAllPosts = useCallback(() => state.posts, [state.posts]);

  const getUser = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const getOrganization = useCallback((id: string) => state.users.find((u) => u.id === id && u.role === 'organization') as OrganizationUser | undefined, [state.users]);
  const getOrganizations = useCallback(() => state.users.filter((u) => u.role === 'organization') as OrganizationUser[], [state.users]);
  const getCitizen = useCallback((id: string) => state.users.find((u) => u.id === id && u.role === 'citizen') as CitizenUser | undefined, [state.users]);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        loading: !state.loaded,
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
        refresh,
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
