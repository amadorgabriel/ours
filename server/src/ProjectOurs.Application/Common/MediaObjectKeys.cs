namespace ProjectOurs.Application.Common;

public static class MediaObjectKeys
{
    /// <summary>Creates a unique photo key under the family's parent path with a MIME-based extension.</summary>
    public static string ParentPhoto(Guid familyId, Guid parentId, string mimeType) =>
        $"families/{familyId:D}/parents/{parentId:D}/{Guid.NewGuid():D}{ExtensionForMime(mimeType)}";

    /// <summary>Creates a unique photo key under the family's activity path with a MIME-based extension.</summary>
    public static string ActivityVisitPhoto(Guid familyId, Guid activityId, string mimeType) =>
        $"families/{familyId:D}/activities/{activityId:D}/{Guid.NewGuid():D}{ExtensionForMime(mimeType)}";

    /// <summary>Maps JPEG and PNG MIME types to file extensions, falling back to .bin for other types.</summary>
    private static string ExtensionForMime(string mimeType)
    {
        var normalized = mimeType.Equals("image/jpg", StringComparison.OrdinalIgnoreCase)
            ? "image/jpeg"
            : mimeType.ToLowerInvariant();

        return normalized switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            _ => ".bin",
        };
    }
}
