package com.ttb.equipment.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.FutureOrPresent
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.util.UUID

data class CreateRequestItemDto(
    @field:NotBlank(message = "Equipment type is required")
    @field:Pattern(regexp = "^(NOTEBOOK|MONITOR|KEYBOARD|MOUSE|HEADSET|OTHER)$", message = "Invalid equipment type")
    val equipmentType: String,

    @field:Size(max = 250, message = "Specification must not exceed 250 characters")
    val specification: String? = null,

    @field:NotNull(message = "Quantity is required")
    @field:Min(value = 1, message = "Quantity must be at least 1")
    @field:Max(value = 5, message = "Quantity must not exceed 5")
    val quantity: Int
)

data class CreateEquipmentRequestDto(
    @field:NotBlank(message = "Employee name is required")
    @field:Size(min = 2, max = 100, message = "Employee name must be between 2 and 100 characters")
    val employeeName: String,

    @field:NotBlank(message = "Employee email is required")
    @field:Email(message = "Email format is invalid")
    val employeeEmail: String,

    @field:NotBlank(message = "Department is required")
    val department: String,

    @field:NotBlank(message = "Title is required")
    @field:Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    val title: String,

    @field:NotBlank(message = "Purpose is required")
    @field:Size(min = 10, max = 500, message = "Purpose must be between 10 and 500 characters")
    val purpose: String,

    @field:Size(max = 500, message = "Additional note must not exceed 500 characters")
    val additionalNote: String? = null,

    val version: Int? = null,

    @field:NotNull(message = "Required date is required")
    @field:FutureOrPresent(message = "Required date must not be in the past")
    val requiredDate: LocalDate,

    // Note: Request requires at least 1 item when submitting. 
    // We allow empty items for saving DRAFT, so we don't put @NotEmpty here. 
    // The submit-time validation will happen in the Service layer.
    val items: List<CreateRequestItemDto> = emptyList()
)

data class RejectRequestDto(
    @field:NotBlank(message = "Reject reason is required")
    val rejectReason: String
)

data class PaginatedResponseDto<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
)

data class RequestItemResponseDto(
    val id: UUID,
    val equipmentType: String,
    val specification: String?,
    val quantity: Int
)

data class EquipmentRequestResponseDto(
    val id: UUID,
    val requestNumber: String?,
    val requesterId: String,
    val employeeName: String,
    val employeeEmail: String,
    val department: String,
    val title: String,
    val purpose: String,
    val additionalNote: String?,
    val requiredDate: LocalDate,
    val status: String,
    val approverId: String?,
    val rejectReason: String?,
    val version: Int,
    val createdAt: java.time.OffsetDateTime,
    val updatedAt: java.time.OffsetDateTime,
    val items: List<RequestItemResponseDto>
)
