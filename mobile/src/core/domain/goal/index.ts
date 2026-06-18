export type GoalId = string;

export type GoalStatus = 'Active' | 'Completed' | 'Cancelled';

export type Goal = {
  id: GoalId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  status: GoalStatus;
  createdAt: string;
  createdBy: string;
};

export type GoalListResponse = {
  items: Goal[];
};

export type CreateGoalRequest = {
  title: string;
  targetAmount: number;
};

export type CreateGoalResponse = Goal;
