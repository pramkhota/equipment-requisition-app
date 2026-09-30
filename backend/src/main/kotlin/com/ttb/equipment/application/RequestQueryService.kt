package com.ttb.equipment.application

import com.ttb.equipment.domain.entity.EquipmentRequest
import com.ttb.equipment.domain.enums.RequestStatus
import com.ttb.equipment.repository.EquipmentRequestRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class RequestQueryService(
    private val requestRepository: EquipmentRequestRepository
) {
    fun getRequestById(id: UUID): EquipmentRequest? {
        return requestRepository.findById(id).orElse(null)
    }

    fun searchRequests(
        requesterId: String,
        role: String,
        status: RequestStatus?,
        department: String?,
        keyword: String?,
        pageable: Pageable
    ): Page<EquipmentRequest> {
        return requestRepository.searchRequests(requesterId, role, status, department, keyword, pageable)
    }
}
