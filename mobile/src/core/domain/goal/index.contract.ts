import type {
  CreateGoalContributionRequest,
  CreateGoalContributionResponse,
  CreateGoalRequest,
  CreateGoalResponse,
  GoalContributionListResponse,
  GoalListResponse,
} from './index';

export interface IGoal {
  listGoals(): Promise<GoalListResponse>;
  createGoal(params: CreateGoalRequest): Promise<CreateGoalResponse>;
  listGoalContributions(goalId: string): Promise<GoalContributionListResponse>;
  createGoalContribution(
    goalId: string,
    params: CreateGoalContributionRequest
  ): Promise<CreateGoalContributionResponse>;
}
