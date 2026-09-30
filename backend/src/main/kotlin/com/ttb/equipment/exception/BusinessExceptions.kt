package com.ttb.equipment.exception

class ResourceNotFoundException(message: String) : RuntimeException(message)
class InvalidStatusTransitionException(message: String) : RuntimeException(message)
class BusinessRuleViolationException(message: String) : RuntimeException(message)
