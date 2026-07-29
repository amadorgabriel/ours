import type {
  ActivityFeedParams,
  ActivityFeedResponse,
  RegisterCallRequest,
  RegisterCallResponse,
  RegisterVisitRequest,
  RegisterVisitResponse,
  UpdateActivityRequest,
  UpdateActivityResponse,
} from './index';

export interface IActivity {
  listFeed(params?: ActivityFeedParams): Promise<ActivityFeedResponse>;
  registerCall(params: RegisterCallRequest): Promise<RegisterCallResponse>;
  registerVisit(params: RegisterVisitRequest): Promise<RegisterVisitResponse>;
  markSeen(activityId: string): Promise<void>;
  updateActivity(activityId: string, params: UpdateActivityRequest): Promise<UpdateActivityResponse>;
  deleteActivity(activityId: string): Promise<void>;
}
