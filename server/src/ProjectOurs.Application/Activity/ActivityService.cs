using System.Text.Json;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Enums;
using ActivityEntity = ProjectOurs.Domain.Entities.Activity;

namespace ProjectOurs.Application.Activity;

public sealed class ActivityService(
    IActivityRepository activities,
    IFamilyRepository families)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task<ActivityFeedItemDto> RegisterCallAsync(
        Guid userId,
        Guid familyId,
        RegisterCallRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        if (!ActivityRules.IsValidNotes(request.Notes))
        {
            throw new ActivityValidationException(
                $"Notes must be at most {ActivityRules.MaxNotesLength} characters.");
        }

        Guid? parentId = null;
        if (!string.IsNullOrWhiteSpace(request.ParentId))
        {
            if (!Guid.TryParse(request.ParentId, out var parsedParentId))
            {
                throw new ActivityValidationException("Invalid parent id.");
            }

            var parentExists = await activities.ParentBelongsToFamilyAsync(
                parsedParentId,
                familyId,
                cancellationToken);

            if (!parentExists)
            {
                throw new ActivityValidationException("Parent does not belong to this family.");
            }

            parentId = parsedParentId;
        }

        var now = DateTimeOffset.UtcNow;
        var metadata = string.IsNullOrWhiteSpace(request.Notes)
            ? null
            : JsonSerializer.Serialize(new CallActivityMetadata(request.Notes.Trim()), JsonOptions);

        var activity = new ActivityEntity
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            UserId = userId,
            ParentId = parentId,
            Type = ActivityType.Call,
            Metadata = metadata,
            CreatedAt = now,
        };

        var created = await activities.AddAsync(activity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<ActivityFeedResponse> GetFeedAsync(
        Guid userId,
        Guid familyId,
        int? limit,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var normalizedLimit = ActivityRules.NormalizeFeedLimit(limit);
        var items = await activities.ListByFamilyIdAsync(familyId, normalizedLimit, cancellationToken);

        return new ActivityFeedResponse(items.Select(MapToDto).ToList());
    }

    private async Task EnsureMembershipAsync(
        Guid userId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        var membership = await families.GetMembershipAsync(userId, familyId, cancellationToken);
        if (membership is null)
        {
            throw new ActivityForbiddenException("You are not a member of this family.");
        }
    }

    internal static ActivityFeedItemDto MapToDto(ActivityEntity activity)
    {
        string? notes = null;
        if (!string.IsNullOrWhiteSpace(activity.Metadata))
        {
            try
            {
                var metadata = JsonSerializer.Deserialize<CallActivityMetadata>(
                    activity.Metadata,
                    JsonOptions);
                notes = metadata?.Notes;
            }
            catch (JsonException)
            {
                notes = null;
            }
        }

        return new ActivityFeedItemDto(
            activity.Id.ToString(),
            activity.Type.ToString(),
            activity.CreatedAt,
            activity.UserId.ToString(),
            activity.User?.Name ?? "Usuário",
            activity.ParentId?.ToString(),
            activity.Parent?.Name,
            notes);
    }

    private sealed record CallActivityMetadata(string? Notes);
}
