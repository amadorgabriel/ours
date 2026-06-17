namespace ProjectOurs.Application.Family;

public sealed class FamilyValidationException(string message) : Exception(message);

public sealed class FamilyNotFoundException(string message) : Exception(message);

public sealed class FamilyForbiddenException(string message) : Exception(message);

public sealed class FamilyConflictException(string message) : Exception(message);

public sealed class InviteCodeConflictException() : Exception("Invite code already exists.");
