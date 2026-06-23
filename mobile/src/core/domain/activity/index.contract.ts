import type {
  ActivityFeedParams,
  ActivityFeedResponse,
  RegisterCallRequest,
  RegisterCallResponse,
  RegisterVisitRequest,
  RegisterVisitResponse,
} from './index';

export interface IActivity {
  listFeed(params?: ActivityFeedParams): Promise<ActivityFeedResponse>;
  registerCall(params: RegisterCallRequest): Promise<RegisterCallResponse>;
  registerVisit(params: RegisterVisitRequest): Promise<RegisterVisitResponse>;
  markSeen(activityId: string): Promise<void>;
}
