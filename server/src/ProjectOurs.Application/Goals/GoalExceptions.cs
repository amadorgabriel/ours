namespace ProjectOurs.Application.Goals;

public class GoalValidationException(string message) : Exception(message);

public class GoalForbiddenException(string message) : Exception(message);
