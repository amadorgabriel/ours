namespace ProjectOurs.Application.Parents;

public static class ParentRules
{
    public const int MaxNameLength = 100;
    public const int MaxRelationshipLength = 20;

    public static bool IsValidName(string? name) =>
        !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= MaxNameLength;

    public static bool IsValidRelationship(string? relationship) =>
        !string.IsNullOrWhiteSpace(relationship)
        && relationship.Trim().Length <= MaxRelationshipLength;
}
