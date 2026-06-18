import type {
  ActivityFeedResponse,
  RegisterCallRequest,
  RegisterCallResponse,
} from './index';

export interface IActivity {
  listFeed(limit?: number): Promise<ActivityFeedResponse>;
  registerCall(params: RegisterCallRequest): Promise<RegisterCallResponse>;
}
