package com.ttb.equipment.configuration

import com.ttb.equipment.exception.BusinessRuleViolationException
import com.ttb.equipment.exception.InvalidStatusTransitionException
import com.ttb.equipment.exception.ResourceNotFoundException
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

data class ErrorResponse(
    val timestamp: String = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
    val status: Int,
    val code: String,
    val message: String?,
    val path: String,
    val fieldErrors: Map<String, String>? = null
)

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(e: ResourceNotFoundException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        return buildError(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", e.message ?: "Resource not found", request.requestURI, null)
    }

    @ExceptionHandler(InvalidStatusTransitionException::class, BusinessRuleViolationException::class)
    fun handleBusinessRules(e: RuntimeException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_ERROR", e.message ?: "Business rule violation", request.requestURI, null)
    }

    // Version conflict or state conflict
    @ExceptionHandler(ObjectOptimisticLockingFailureException::class, IllegalStateException::class)
    fun handleOptimisticLocking(e: RuntimeException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        return buildError(HttpStatus.CONFLICT, "REQUEST_VERSION_CONFLICT", e.message ?: "This request has been updated by another user", request.requestURI, null)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(e: MethodArgumentNotValidException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        val fieldErrors = e.bindingResult.fieldErrors.associate { it.field to (it.defaultMessage ?: "Invalid value") }
        return buildError(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed", request.requestURI, fieldErrors)
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(e: Exception, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "UNEXPECTED_ERROR", e.message ?: "An unexpected error occurred", request.requestURI, null)
    }

    private fun buildError(status: HttpStatus, code: String, message: String, path: String, fieldErrors: Map<String, String>?): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(status).body(
            ErrorResponse(
                status = status.value(),
                code = code,
                message = message,
                path = path,
                fieldErrors = fieldErrors ?: emptyMap()
            )
        )
    }
}
