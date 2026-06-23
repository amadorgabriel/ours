namespace ProjectOurs.Application.Activity;

public class ActivityValidationException(string message) : Exception(message);

public class ActivityForbiddenException(string message) : Exception(message);

public class ActivityNotFoundException(string message) : Exception(message);
