using ProjectOurs.Application.DTOs;

namespace ProjectOurs.Application.Interfaces;

public interface IActivityService
{
    Task<ActivityDto> CreateCallActivityAsync(Guid userId, CreateCallActivityRequest request, CancellationToken cancellationToken = default);
    Task<ActivityFeedResponse> GetFeedAsync(Guid userId, int limit = 20, int offset = 0, CancellationToken cancellationToken = default);
    Task<UserStatsDto> GetMyStatsAsync(Guid userId, CancellationToken cancellationToken = default);
}
