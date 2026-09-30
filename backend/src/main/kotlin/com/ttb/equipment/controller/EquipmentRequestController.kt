package com.ttb.equipment.controller

import com.ttb.equipment.dto.*
import com.ttb.equipment.domain.entity.EquipmentRequest
import com.ttb.equipment.domain.enums.RequestStatus
import com.ttb.equipment.application.RequestCommandService
import com.ttb.equipment.application.RequestQueryService
import jakarta.validation.Valid
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

private fun EquipmentRequest.toResponseDto(): EquipmentRequestResponseDto {
    return EquipmentRequestResponseDto(
        id = this.id,
        requestNumber = this.requestNumber,
        requesterId = this.requesterId,
        employeeName = this.employeeName,
        employeeEmail = this.employeeEmail,
        department = this.department,
        title = this.title,
        purpose = this.purpose,
        additionalNote = this.additionalNote,
        requiredDate = this.requiredDate,
        status = this.status.name,
        approverId = this.approverId,
        rejectReason = this.rejectReason,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        items = this.items.map { 
            RequestItemResponseDto(
                id = it.id,
                equipmentType = it.equipmentType,
                specification = it.specification,
                quantity = it.quantity
            )
        }
    )
}

@RestController
@RequestMapping("/api/v1/equipment-requests")
class EquipmentRequestController(
    private val commandService: RequestCommandService,
    private val queryService: RequestQueryService
) {

    @PostMapping
    fun createDraft(
        @RequestHeader("X-User-Id") userId: String,
        @Valid @RequestBody dto: CreateEquipmentRequestDto
    ): ResponseEntity<EquipmentRequestResponseDto> {
        val request = commandService.createDraft(userId, dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(request.toResponseDto())
    }

    @PostMapping("/{id}/submit")
    fun submitRequest(
        @PathVariable id: UUID,
        @RequestHeader("X-User-Id") userId: String
    ): ResponseEntity<EquipmentRequestResponseDto> {
        val request = commandService.submitRequest(id, userId)
        return ResponseEntity.ok(request.toResponseDto())
    }

    @PutMapping("/{id}")
    fun updateDraft(
        @PathVariable id: UUID,
        @RequestHeader("X-User-Id") userId: String,
        @Valid @RequestBody dto: CreateEquipmentRequestDto
    ): ResponseEntity<EquipmentRequestResponseDto> {
        val request = commandService.updateDraft(id, userId, dto)
        return ResponseEntity.ok(request.toResponseDto())
    }

    @PostMapping("/{id}/cancel")
    fun cancelRequest(
        @PathVariable id: UUID,
        @RequestHeader("X-User-Id") userId: String
    ): ResponseEntity<EquipmentRequestResponseDto> {
        val request = commandService.cancelRequest(id, userId)
        return ResponseEntity.ok(request.toResponseDto())
    }

    @PostMapping("/{id}/approve")
    fun approveRequest(
        @PathVariable id: UUID,
        @RequestHeader("X-User-Id") approverId: String
    ): ResponseEntity<EquipmentRequestResponseDto> {
        val request = commandService.approveRequest(id, approverId)
        return ResponseEntity.ok(request.toResponseDto())
    }

    @PostMapping("/{id}/reject")
    fun rejectRequest(
        @PathVariable id: UUID,
        @RequestHeader("X-User-Id") approverId: String,
        @Valid @RequestBody dto: RejectRequestDto
    ): ResponseEntity<EquipmentRequestResponseDto> {
        val request = commandService.rejectRequest(id, approverId, dto.rejectReason)
        return ResponseEntity.ok(request.toResponseDto())
    }

    @GetMapping("/{id}")
    fun getRequestById(@PathVariable id: UUID): ResponseEntity<EquipmentRequestResponseDto> {
        val request = queryService.getRequestById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(request.toResponseDto())
    }

    @GetMapping
    fun searchRequests(
        @RequestHeader("X-User-Id") userId: String,
        @RequestHeader("X-Role", defaultValue = "EMPLOYEE") role: String,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) department: String?,
        @RequestParam(required = false) keyword: String?,
        @PageableDefault(sort = ["createdAt"], direction = Sort.Direction.DESC) pageable: Pageable
    ): ResponseEntity<PaginatedResponseDto<EquipmentRequestResponseDto>> {
        val requestStatus = status?.takeIf { it.isNotBlank() }?.let { RequestStatus.valueOf(it) }
        val searchKeyword = keyword?.takeIf { it.isNotBlank() }
        val searchDepartment = department?.takeIf { it.isNotBlank() }
        
        val page = queryService.searchRequests(userId, role, requestStatus, searchDepartment, searchKeyword, pageable)
        
        val response = PaginatedResponseDto(
            content = page.content.map { it.toResponseDto() },
            page = page.number,
            size = page.size,
            totalElements = page.totalElements,
            totalPages = page.totalPages
        )
        return ResponseEntity.ok(response)
    }
}
