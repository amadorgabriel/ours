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

export type GoalContribution = {
  id: string;
  amount: number | null;
  isPrivate: boolean;
  userId: string;
  userName: string;
  createdAt: string;
};

export type GoalContributionListResponse = {
  items: GoalContribution[];
};

export type CreateGoalContributionRequest = {
  amount: number;
  isPrivate: boolean;
};

export type CreateGoalContributionResponse = GoalContribution;

export type UpdateGoalContributionRequest = {
  amount: number;
  isPrivate: boolean;
};
