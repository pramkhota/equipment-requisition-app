package com.ttb.equipment.domain.entity

import com.ttb.equipment.domain.enums.RequestStatus
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "equipment_requests")
class EquipmentRequest(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(unique = true)
    var requestNumber: String? = null,

    @Column(nullable = false)
    val requesterId: String,

    @Column(nullable = false)
    var employeeName: String,

    @Column(nullable = false)
    var employeeEmail: String,

    @Column(nullable = false)
    var department: String,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var purpose: String,

    @Column(columnDefinition = "TEXT")
    var additionalNote: String? = null,

    @Column(nullable = false)
    var requiredDate: LocalDate,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: RequestStatus = RequestStatus.DRAFT,

    var approverId: String? = null,

    @Column(name = "rejection_reason")
    var rejectReason: String? = null,

    @OneToMany(mappedBy = "request", cascade = [CascadeType.ALL], orphanRemoval = true)
    var items: MutableList<RequestItem> = mutableListOf(),

    @Version
    var version: Int = 0,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @UpdateTimestamp
    var updatedAt: OffsetDateTime = OffsetDateTime.now()
) {
    fun addItem(item: RequestItem) {
        items.add(item)
        item.request = this
    }

    fun removeItem(item: RequestItem) {
        items.remove(item)
        item.request = null
    }

    @PrePersist
    fun prePersist() {
        if (requestNumber == null) {
            val year = java.time.LocalDate.now().year
            val randomSuffix = (1..999999).random().toString().padStart(6, '0')
            requestNumber = "REQ-$year-$randomSuffix"
        }
    }
}
