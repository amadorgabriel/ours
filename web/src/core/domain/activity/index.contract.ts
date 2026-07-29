import type {
  ActivityFeedParams,
  ActivityFeedResponse,
  RegisterCallRequest,
  RegisterCallResponse,
} from './index';

export interface IActivity {
  listFeed(params?: ActivityFeedParams): Promise<ActivityFeedResponse>;
  registerCall(params: RegisterCallRequest): Promise<RegisterCallResponse>;
}
