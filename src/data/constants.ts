export const NAGPUR_CENTER: [number, number] = [21.1458, 79.0882];

export const NAGPUR_LOCALITIES: Record<string, [number, number]> = {
  Dharampeth: [21.152, 79.083],
  'Civil Lines': [21.167, 79.092],
  Sadar: [21.158, 79.078],
  Sitabuldi: [21.146, 79.078],
  Mahal: [21.137, 79.085],
  Ramdaspeth: [21.143, 79.074],
  'Manish Nagar': [21.128, 79.045],
  'Trimurti Nagar': [21.115, 79.058],
  'Wardha Road': [21.132, 79.065],
  'Pratap Nagar': [21.185, 79.075],
  'Laxmi Nagar': [21.172, 79.068],
  'Seminary Hills': [21.175, 79.085],
};

export const CITIZEN_LOCALITIES = [
  'Dharampeth',
  'Civil Lines',
  'Sadar',
  'Sitabuldi',
  'Mahal',
  'Ramdaspeth',
  'Manish Nagar',
  'Trimurti Nagar',
  'Wardha Road',
];

export const ORG_TYPES = [
  'Municipal Service',
  'Road / Infrastructure',
  'Water Service',
  'Public Utility',
  'NGO',
  'Community Organization',
  'Emergency Service',
  'Other',
];

export const ISSUE_CATEGORIES = [
  'Road Damage',
  'Streetlight',
  'Water Supply',
  'Garbage',
  'Drainage',
  'Traffic',
  'Public Transport',
  'Footpath',
  'Electricity',
  'Other',
];

export const POST_TYPES = ['Issue', 'Event', 'Community Initiative', 'Announcement', 'Civic Discussion'];

export const ISSUE_STATUSES = [
  'Reported',
  'Community Attention',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolution Submitted',
  'Community Feedback',
  'Resolved',
];

export const CATEGORY_ICONS: Record<string, string> = {
  'Road Damage': 'Construction',
  Streetlight: 'Lightbulb',
  'Water Supply': 'Droplets',
  Garbage: 'Trash2',
  Drainage: 'Waves',
  Traffic: 'Car',
  'Public Transport': 'Bus',
  Footpath: 'Footprints',
  Electricity: 'Zap',
  Other: 'CircleAlert',
};

export const STATUS_COLORS: Record<string, string> = {
  Reported: 'bg-gray-100 text-gray-700 border-gray-300',
  'Community Attention': 'bg-orange-100 text-orange-700 border-orange-300',
  Verified: 'bg-blue-100 text-blue-700 border-blue-300',
  Assigned: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-300',
  'Resolution Submitted': 'bg-purple-100 text-purple-700 border-purple-300',
  'Community Feedback': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  Resolved: 'bg-green-100 text-green-700 border-green-300',
};

export const STATUS_ICONS: Record<string, string> = {
  Reported: 'Flag',
  'Community Attention': 'Users',
  Verified: 'BadgeCheck',
  Assigned: 'UserCheck',
  'In Progress': 'Loader',
  'Resolution Submitted': 'CheckCircle2',
  'Community Feedback': 'MessageSquare',
  Resolved: 'CheckCircle',
};

export const CATEGORY_FILTER_MAP: Record<string, string[]> = {
  Roads: ['Road Damage', 'Footpath', 'Traffic'],
  Water: ['Water Supply', 'Drainage'],
  Garbage: ['Garbage'],
  Streetlights: ['Streetlight'],
  Transport: ['Public Transport'],
};

export const CATEGORY_ORG_MAP: Record<string, string> = {
  'Road Damage': 'o-demo',
  Streetlight: 'o-3',
  'Water Supply': 'o-1',
  Garbage: 'o-2',
  Drainage: 'o-1',
  Traffic: 'o-demo',
  'Public Transport': 'o-demo',
  Footpath: 'o-demo',
  Electricity: 'o-3',
  Other: '',
};

export const ORG_CATEGORY_MAP: Record<string, string[]> = {
  'o-demo': ['Road Damage', 'Footpath', 'Traffic', 'Public Transport', 'Other'],
  'o-1': ['Water Supply', 'Drainage'],
  'o-2': ['Garbage'],
  'o-3': ['Streetlight', 'Electricity'],
  'o-4': [],
};

export const CITIZEN_POST_TYPES = ['Issue', 'Event', 'Community Initiative'];
export const ORG_POST_TYPES = ['Announcement', 'Event', 'Community Initiative', 'Community Update'];
