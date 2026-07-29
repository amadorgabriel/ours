namespace ProjectOurs.Application.Parents;

public static class ParentRules
{
    public const int MaxNameLength = 100;
    public const int MaxRelationshipLength = 20;
    public const int MaxMedicalInfoLength = 4000;
    public const int MaxEmergencyBriefingLength = 4000;

    public static bool IsValidName(string? name) =>
        !string.IsNullOrWhiteSpace(name) && name.Trim().Length <= MaxNameLength;

    public static bool IsValidRelationship(string? relationship) =>
        !string.IsNullOrWhiteSpace(relationship)
        && relationship.Trim().Length <= MaxRelationshipLength;

    public static bool IsValidMedicalInfo(string? medicalInfo) =>
        medicalInfo is null || medicalInfo.Trim().Length <= MaxMedicalInfoLength;

    public static bool IsValidEmergencyBriefing(string? emergencyBriefing) =>
        emergencyBriefing is null || emergencyBriefing.Trim().Length <= MaxEmergencyBriefingLength;
}
