export type ActivityId = string;

export type ActivityType = 'Call' | 'Visit' | 'Medical' | 'Task' | 'Medication';

export type ActivityFeedItem = {
  id: ActivityId;
  type: ActivityType;
  createdAt: string;
  userId: string;
  userName: string;
  parentId?: string;
  parentName?: string;
  notes?: string;
};

export type RegisterCallRequest = {
  parentId?: string;
  notes?: string;
};

export type RegisterCallResponse = ActivityFeedItem;

export type ActivityFeedParams = {
  limit?: number;
  from?: string;
  to?: string;
};

export type ActivityFeedResponse = {
  items: ActivityFeedItem[];
};
