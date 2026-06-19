namespace ProjectOurs.Application.Parents;

public class ParentValidationException(string message) : Exception(message);

public class ParentForbiddenException(string message) : Exception(message);

public class ParentNotFoundException(string message) : Exception(message);
