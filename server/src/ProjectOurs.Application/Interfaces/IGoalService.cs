using ProjectOurs.Application.DTOs;

namespace ProjectOurs.Application.Interfaces;

public interface IGoalService
{
    Task<GoalDto> CreateGoalAsync(Guid userId, CreateGoalRequest request, CancellationToken cancellationToken = default);
    Task<List<GoalDto>> GetGoalsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<GoalDetailDto> GetGoalAsync(Guid userId, Guid goalId, CancellationToken cancellationToken = default);
    Task<ContributeResponse> ContributeAsync(Guid userId, Guid goalId, ContributeRequest request, CancellationToken cancellationToken = default);
    Task<MyContributionsResponse> GetMyContributionsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task CancelGoalAsync(Guid userId, Guid goalId, CancellationToken cancellationToken = default);
}
