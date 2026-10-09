namespace ProjectOurs.Application.Common;

public static class MediaObjectKeys
{
    public static string ParentPhoto(Guid familyId, Guid parentId, string mimeType) =>
        $"families/{familyId:D}/parents/{parentId:D}/{Guid.NewGuid():D}{ExtensionForMime(mimeType)}";

    public static string ActivityVisitPhoto(Guid familyId, Guid activityId, string mimeType) =>
        $"families/{familyId:D}/activities/{activityId:D}/{Guid.NewGuid():D}{ExtensionForMime(mimeType)}";

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
