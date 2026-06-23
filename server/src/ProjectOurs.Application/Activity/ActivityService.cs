using System.Text.Json;
using ProjectOurs.Application.Abstractions.Media;
using ProjectOurs.Application.Common;
using ProjectOurs.Application.Abstractions.Persistence;
using ProjectOurs.Domain.Enums;
using ActivityEntity = ProjectOurs.Domain.Entities.Activity;

namespace ProjectOurs.Application.Activity;

public sealed class ActivityService(
    IActivityRepository activities,
    IFamilyRepository families,
    IMediaStorage mediaStorage)
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

        var parentId = await ResolveParentIdAsync(request.ParentId, familyId, cancellationToken);
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

    public async Task<ActivityFeedItemDto> RegisterVisitAsync(
        Guid userId,
        Guid familyId,
        RegisterVisitRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var parentId = await ResolveParentIdAsync(request.ParentId, familyId, cancellationToken);
        ValidateVisitDates(request);

        string? photoUrl = null;
        if (!string.IsNullOrWhiteSpace(request.PhotoBase64))
        {
            var mimeType = string.IsNullOrWhiteSpace(request.MimeType) ? "image/jpeg" : request.MimeType;
            var bytes = DecodeBase64Image(request.PhotoBase64);
            await using var stream = new MemoryStream(bytes);
            photoUrl = await mediaStorage.StoreAsync(stream, mimeType, cancellationToken);
        }

        var now = DateTimeOffset.UtcNow;
        var metadata = JsonSerializer.Serialize(
            new VisitActivityMetadata(
                request.AllDay,
                request.StartAt,
                request.EndAt,
                photoUrl,
                request.MimeType),
            JsonOptions);

        var activity = new ActivityEntity
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            UserId = userId,
            ParentId = parentId,
            Type = ActivityType.Visit,
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
        DateTimeOffset? from = null,
        DateTimeOffset? to = null,
        string? parentId = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);
        ActivityRules.ValidateFeedDateRange(from, to);

        var parsedParentId = await ResolveOptionalParentIdAsync(parentId, familyId, cancellationToken);
        var normalizedLimit = ActivityRules.NormalizeFeedLimit(limit);
        var items = await activities.ListByFamilyIdAsync(
            familyId,
            normalizedLimit,
            from,
            to,
            parsedParentId,
            cancellationToken);

        var viewsByActivity = await activities.ListViewsByActivityIdsAsync(
            items.Select(x => x.Id),
            cancellationToken);

        var unreadCount = await activities.CountUnreadAsync(
            familyId,
            userId,
            parsedParentId,
            cancellationToken);

        return new ActivityFeedResponse(
            items.Select(activity => MapToDto(activity, viewsByActivity.GetValueOrDefault(activity.Id))).ToList(),
            unreadCount);
    }

    public async Task MarkSeenAsync(
        Guid userId,
        Guid familyId,
        Guid activityId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, familyId, cancellationToken);

        var activity = await activities.GetByIdAndFamilyIdAsync(activityId, familyId, cancellationToken);
        if (activity is null)
        {
            throw new ActivityNotFoundException("Activity not found.");
        }

        await activities.UpsertViewAsync(activityId, userId, DateTimeOffset.UtcNow, cancellationToken);
    }

    public async Task<ActivityFeedItemDto> CreateContributionActivityAsync(
        Guid userId,
        Guid familyId,
        Guid goalId,
        string goalTitle,
        Guid contributionId,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var metadata = JsonSerializer.Serialize(
            new ContributionActivityMetadata(goalId.ToString(), goalTitle, amount, contributionId.ToString()),
            JsonOptions);

        var activity = new ActivityEntity
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            UserId = userId,
            Type = ActivityType.Contribution,
            Metadata = metadata,
            CreatedAt = now,
        };

        var created = await activities.AddAsync(activity, cancellationToken);
        return MapToDto(created);
    }

    public async Task SyncContributionActivityAsync(
        Guid userId,
        Guid familyId,
        Guid contributionId,
        Guid goalId,
        string goalTitle,
        decimal amount,
        bool isPrivate,
        CancellationToken cancellationToken = default)
    {
        var existing = await activities.FindByContributionIdAsync(contributionId, familyId, cancellationToken);

        if (isPrivate)
        {
            if (existing is not null)
            {
                await activities.DeleteAsync(existing, cancellationToken);
            }

            return;
        }

        var metadata = JsonSerializer.Serialize(
            new ContributionActivityMetadata(goalId.ToString(), goalTitle, amount, contributionId.ToString()),
            JsonOptions);

        if (existing is null)
        {
            var activity = new ActivityEntity
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                UserId = userId,
                Type = ActivityType.Contribution,
                Metadata = metadata,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            await activities.AddAsync(activity, cancellationToken);
            return;
        }

        existing.Metadata = metadata;
        existing.CreatedAt = DateTimeOffset.UtcNow;
        await activities.UpdateAsync(existing, cancellationToken);
    }

    public async Task DeleteContributionActivityAsync(
        Guid familyId,
        Guid contributionId,
        CancellationToken cancellationToken = default)
    {
        var existing = await activities.FindByContributionIdAsync(contributionId, familyId, cancellationToken);
        if (existing is not null)
        {
            await activities.DeleteAsync(existing, cancellationToken);
        }
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

    private async Task<Guid?> ResolveParentIdAsync(
        string? parentId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(parentId))
        {
            return null;
        }

        if (!Guid.TryParse(parentId, out var parsedParentId))
        {
            throw new ActivityValidationException("Invalid parent id.");
        }

        var parentExists = await activities.ParentBelongsToFamilyAsync(parsedParentId, familyId, cancellationToken);
        if (!parentExists)
        {
            throw new ActivityValidationException("Parent does not belong to this family.");
        }

        return parsedParentId;
    }

    private async Task<Guid?> ResolveOptionalParentIdAsync(
        string? parentId,
        Guid familyId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(parentId))
        {
            return null;
        }

        return await ResolveParentIdAsync(parentId, familyId, cancellationToken);
    }

    private static void ValidateVisitDates(RegisterVisitRequest request)
    {
        if (request.AllDay)
        {
            return;
        }

        if (request.EndAt is null)
        {
            throw new ActivityValidationException("End date is required when visit is not all-day.");
        }

        if (request.EndAt < request.StartAt)
        {
            throw new ActivityValidationException("End date must be after start date.");
        }
    }

    private static byte[] DecodeBase64Image(string photoBase64)
    {
        try
        {
            return Base64ImageHelper.Decode(photoBase64);
        }
        catch (FormatException)
        {
            throw new ActivityValidationException("Invalid photo data.");
        }
        catch (InvalidOperationException ex)
        {
            throw new ActivityValidationException(ex.Message);
        }
    }

    internal static ActivityFeedItemDto MapToDto(
        ActivityEntity activity,
        IReadOnlyList<ActivityViewInfo>? views = null)
    {
        string? notes = null;
        bool? allDay = null;
        DateTimeOffset? startAt = null;
        DateTimeOffset? endAt = null;
        string? photoUrl = null;
        string? goalId = null;
        string? goalTitle = null;
        decimal? contributionAmount = null;

        if (!string.IsNullOrWhiteSpace(activity.Metadata))
        {
            try
            {
                using var doc = JsonDocument.Parse(activity.Metadata);
                var root = doc.RootElement;

                switch (activity.Type)
                {
                    case ActivityType.Call:
                        notes = root.TryGetProperty("notes", out var notesProp)
                            ? notesProp.GetString()
                            : null;
                        break;
                    case ActivityType.Visit:
                        allDay = root.TryGetProperty("allDay", out var allDayProp) && allDayProp.GetBoolean();
                        startAt = root.TryGetProperty("startAt", out var startProp)
                            ? startProp.GetDateTimeOffset()
                            : null;
                        endAt = root.TryGetProperty("endAt", out var endProp) && endProp.ValueKind != JsonValueKind.Null
                            ? endProp.GetDateTimeOffset()
                            : null;
                        photoUrl = root.TryGetProperty("photoBase64", out var photoProp)
                            ? photoProp.GetString()
                            : null;
                        break;
                    case ActivityType.Contribution:
                        goalId = root.TryGetProperty("goalId", out var goalIdProp)
                            ? goalIdProp.GetString()
                            : null;
                        goalTitle = root.TryGetProperty("goalTitle", out var goalTitleProp)
                            ? goalTitleProp.GetString()
                            : null;
                        contributionAmount = root.TryGetProperty("amount", out var amountProp)
                            ? amountProp.GetDecimal()
                            : null;
                        break;
                }
            }
            catch (JsonException)
            {
                // ignore malformed metadata
            }
        }

        IReadOnlyList<ActivitySeenByDto>? seenBy = views?
            .Select(v => new ActivitySeenByDto(v.UserId.ToString(), v.UserName, v.SeenAt))
            .ToList();

        return new ActivityFeedItemDto(
            activity.Id.ToString(),
            activity.Type.ToString(),
            activity.CreatedAt,
            activity.UserId.ToString(),
            activity.User?.Name ?? "Usuário",
            activity.ParentId?.ToString(),
            activity.Parent?.Name,
            notes,
            allDay,
            startAt,
            endAt,
            photoUrl,
            goalId,
            goalTitle,
            contributionAmount,
            seenBy);
    }

    private sealed record CallActivityMetadata(string? Notes);

    private sealed record VisitActivityMetadata(
        bool AllDay,
        DateTimeOffset StartAt,
        DateTimeOffset? EndAt,
        string? PhotoBase64,
        string? MimeType);

    internal sealed record ContributionActivityMetadata(
        string GoalId,
        string GoalTitle,
        decimal Amount,
        string ContributionId);
}
