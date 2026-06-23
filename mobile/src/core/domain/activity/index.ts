export type ActivityId = string;

export type ActivityType =
  | 'Call'
  | 'Visit'
  | 'Medical'
  | 'Task'
  | 'Medication'
  | 'Contribution';

export type ActivitySeenBy = {
  userId: string;
  userName: string;
  seenAt: string;
};

export type ActivityFeedItem = {
  id: ActivityId;
  type: ActivityType;
  createdAt: string;
  userId: string;
  userName: string;
  parentId?: string;
  parentName?: string;
  notes?: string;
  allDay?: boolean;
  startAt?: string;
  endAt?: string;
  photoUrl?: string;
  goalId?: string;
  goalTitle?: string;
  contributionAmount?: number;
  seenBy?: ActivitySeenBy[];
};

export type RegisterCallRequest = {
  parentId?: string;
  notes?: string;
};

export type RegisterCallResponse = ActivityFeedItem;

export type RegisterVisitRequest = {
  parentId?: string;
  allDay: boolean;
  startAt: string;
  endAt?: string;
  photoBase64?: string;
  mimeType?: string;
};

export type RegisterVisitResponse = ActivityFeedItem;

export type ActivityFeedParams = {
  limit?: number;
  from?: string;
  to?: string;
  parentId?: string;
};

export type ActivityFeedResponse = {
  items: ActivityFeedItem[];
  unreadCount: number;
};
