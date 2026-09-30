package com.ttb.equipment.application

import com.ttb.equipment.dto.CreateEquipmentRequestDto
import com.ttb.equipment.dto.RejectRequestDto
import com.ttb.equipment.domain.entity.EquipmentRequest
import com.ttb.equipment.domain.entity.RequestItem
import com.ttb.equipment.domain.enums.RequestStatus
import com.ttb.equipment.exception.BusinessRuleViolationException
import com.ttb.equipment.exception.InvalidStatusTransitionException
import com.ttb.equipment.exception.ResourceNotFoundException

import com.ttb.equipment.repository.EquipmentRequestRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class RequestCommandService(
    private val requestRepository: EquipmentRequestRepository,
    
) {

    @Transactional
    fun createDraft(requesterId: String, dto: CreateEquipmentRequestDto): EquipmentRequest {
        validateItems(dto)

        val request = EquipmentRequest(
            requesterId = requesterId,
            employeeName = dto.employeeName,
            employeeEmail = dto.employeeEmail,
            department = dto.department,
            title = dto.title,
            purpose = dto.purpose,
            additionalNote = dto.additionalNote,
            requiredDate = dto.requiredDate,
            status = RequestStatus.DRAFT
        )

        // Group by equipmentId to merge duplicates and check total quantity
        // Group by equipmentType to check max 5 pieces rule
        val typeQuantities = mutableMapOf<String, Int>()
        val exactTypes = mutableSetOf<String>()
        for (item in dto.items) {
            val exactType = item.equipmentType.trim().lowercase()
            if (!exactTypes.add(exactType)) {
                throw BusinessRuleViolationException("Duplicate equipment type in request: ${item.equipmentType}. Please combine the quantities.")
            }
            val normalizedType = item.equipmentType.replace("\\s+".toRegex(), "").lowercase()
            typeQuantities[normalizedType] = typeQuantities.getOrDefault(normalizedType, 0) + item.quantity
        }
        for ((type, quantity) in typeQuantities) {
            if (quantity > 5) {
                throw BusinessRuleViolationException("Cannot request more than 5 pieces of the same equipment type ($type)")
            }
        }
        
        // Add items without merging specifications
        dto.items.forEach { dtoItem ->
            val item = RequestItem(
                equipmentType = dtoItem.equipmentType,
                specification = dtoItem.specification,
                quantity = dtoItem.quantity
            )
            request.addItem(item)
        }

        return requestRepository.save(request)
    }

    private fun validateItems(dto: CreateEquipmentRequestDto) {
        if (dto.items.isEmpty()) {
            throw BusinessRuleViolationException("Request must have at least one item")
        }
        val invalidQuantity = dto.items.any { it.quantity < 1 }
        if (invalidQuantity) {
            throw BusinessRuleViolationException("Item quantity must be at least 1")
        }
    }

    @Transactional
    fun submitRequest(requestId: UUID, requesterId: String): EquipmentRequest {
        val request = getRequestForUser(requestId, requesterId)

        if (request.status != RequestStatus.DRAFT) {
            throw InvalidStatusTransitionException("Only DRAFT requests can be submitted")
        }
        if (request.items.isEmpty()) {
            throw BusinessRuleViolationException("Request must have at least one item")
        }

        request.status = RequestStatus.PENDING
        return requestRepository.save(request)
    }

    @Transactional
    fun approveRequest(requestId: UUID, approverId: String): EquipmentRequest {
        val request = requestRepository.findById(requestId)
            .orElseThrow { ResourceNotFoundException("Request not found") }
        if (request.status != RequestStatus.PENDING) {
            throw InvalidStatusTransitionException("Only PENDING requests can be approved")
        }
        request.status = RequestStatus.APPROVED
        request.approverId = approverId
        return requestRepository.save(request)
    }

    @Transactional
    fun rejectRequest(requestId: UUID, approverId: String, reason: String): EquipmentRequest {
        val request = requestRepository.findById(requestId)
            .orElseThrow { ResourceNotFoundException("Request not found") }
        if (request.status != RequestStatus.PENDING) {
            throw InvalidStatusTransitionException("Only PENDING requests can be rejected")
        }
        request.status = RequestStatus.REJECTED
        request.rejectReason = reason
        request.approverId = approverId
        return requestRepository.save(request)
    }

    @Transactional
    fun updateDraft(requestId: UUID, requesterId: String, dto: CreateEquipmentRequestDto): EquipmentRequest {
        val request = getRequestForUser(requestId, requesterId)
        if (dto.version != null && request.version != dto.version) {
            throw IllegalStateException("The request has been updated by someone else. Please refresh and try again.")
        }
        
        if (request.status != RequestStatus.DRAFT) {
            throw InvalidStatusTransitionException("Only DRAFT requests can be edited")
        }
        
        validateItems(dto)

        request.employeeName = dto.employeeName
        request.employeeEmail = dto.employeeEmail
        request.department = dto.department
        request.title = dto.title
        request.purpose = dto.purpose
        request.additionalNote = dto.additionalNote
        request.requiredDate = dto.requiredDate
        request.items.clear()
        
        // Group by equipmentType to check max 5 pieces rule
        val typeQuantities = mutableMapOf<String, Int>()
        val exactTypes = mutableSetOf<String>()
        for (item in dto.items) {
            val exactType = item.equipmentType.trim().lowercase()
            if (!exactTypes.add(exactType)) {
                throw BusinessRuleViolationException("Duplicate equipment type in request: ${item.equipmentType}. Please combine the quantities.")
            }
            val normalizedType = item.equipmentType.replace("\\s+".toRegex(), "").lowercase()
            typeQuantities[normalizedType] = typeQuantities.getOrDefault(normalizedType, 0) + item.quantity
        }
        for ((type, quantity) in typeQuantities) {
            if (quantity > 5) {
                throw BusinessRuleViolationException("Cannot request more than 5 pieces of the same equipment type ($type)")
            }
        }
        
        // Add items without merging specifications
        dto.items.forEach { dtoItem ->
            val item = RequestItem(
                equipmentType = dtoItem.equipmentType,
                specification = dtoItem.specification,
                quantity = dtoItem.quantity
            )
            request.addItem(item)
        }
        
        return requestRepository.save(request)
    }

    @Transactional
    fun cancelRequest(requestId: UUID, requesterId: String): EquipmentRequest {
        val request = getRequestForUser(requestId, requesterId)
        
        if (request.status != RequestStatus.DRAFT && request.status != RequestStatus.PENDING) {
            throw InvalidStatusTransitionException("Only DRAFT or PENDING requests can be cancelled")
        }
        
        request.status = RequestStatus.CANCELLED
        return requestRepository.save(request)
    }

    private fun getRequestForUser(requestId: UUID, requesterId: String): EquipmentRequest {
        val request = requestRepository.findById(requestId)
            .orElseThrow { ResourceNotFoundException("Request not found") }
        
        if (request.requesterId != requesterId) {
            throw BusinessRuleViolationException("You are not authorized to modify this request")
        }
        return request
    }
}
