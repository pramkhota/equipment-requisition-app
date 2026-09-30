package com.ttb.equipment.repository

import com.ttb.equipment.domain.entity.EquipmentRequest
import com.ttb.equipment.domain.enums.RequestStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EquipmentRequestRepository : JpaRepository<EquipmentRequest, UUID> {
    
    @Query("""
        SELECT r FROM EquipmentRequest r 
        WHERE (:role = 'APPROVER' OR r.requesterId = :requesterId)
        AND (:role = 'EMPLOYEE' OR r.status NOT IN ('DRAFT', 'CANCELLED'))
        AND (:status IS NULL OR r.status = :status) 
        AND (:department IS NULL OR r.department = :department)
        AND (:keyword IS NULL OR 
             LOWER(r.requestNumber) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR 
             LOWER(r.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR 
             LOWER(r.employeeName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
    """)
    fun searchRequests(
        requesterId: String, 
        role: String,
        status: RequestStatus?, 
        department: String?,
        keyword: String?, 
        pageable: Pageable
    ): Page<EquipmentRequest>
}
