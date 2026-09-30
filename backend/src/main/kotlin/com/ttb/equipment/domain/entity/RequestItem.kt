package com.ttb.equipment.domain.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "equipment_request_items")
class RequestItem(
    @Id
    val id: UUID = UUID.randomUUID(),

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    var request: EquipmentRequest? = null,

    @Column(nullable = false)
    val equipmentType: String,

    @Column
    val specification: String? = null,

    @Column(nullable = false)
    var quantity: Int
) {
    init {
        require(quantity in 1..5) { "Quantity must be between 1 and 5" }
    }
}
