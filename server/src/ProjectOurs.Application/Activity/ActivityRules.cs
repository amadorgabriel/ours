namespace ProjectOurs.Application.Activity;

public static class ActivityRules
{
    public const int MaxNotesLength = 500;
    public const int DefaultFeedLimit = 50;
    public const int MaxFeedLimit = 100;

    public static bool IsValidNotes(string? notes) =>
        notes is null || notes.Length <= MaxNotesLength;

    public static int NormalizeFeedLimit(int? limit)
    {
        if (limit is null or <= 0)
        {
            return DefaultFeedLimit;
        }

        return Math.Min(limit.Value, MaxFeedLimit);
    }

    public static void ValidateFeedDateRange(DateTimeOffset? from, DateTimeOffset? to)
    {
        if (from is not null && to is not null && from > to)
        {
            throw new ActivityValidationException("'from' must be earlier than or equal to 'to'.");
        }
    }
}
