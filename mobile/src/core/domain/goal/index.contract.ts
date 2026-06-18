import type { CreateGoalRequest, CreateGoalResponse, GoalListResponse } from './index';

export interface IGoal {
  listGoals(): Promise<GoalListResponse>;
  createGoal(params: CreateGoalRequest): Promise<CreateGoalResponse>;
}
