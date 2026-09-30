package com.ttb.equipment.application

import com.ttb.equipment.dto.CreateEquipmentRequestDto
import com.ttb.equipment.dto.CreateRequestItemDto
import com.ttb.equipment.domain.entity.EquipmentRequest
import com.ttb.equipment.domain.entity.RequestItem
import com.ttb.equipment.domain.enums.RequestStatus
import com.ttb.equipment.exception.BusinessRuleViolationException
import com.ttb.equipment.exception.InvalidStatusTransitionException
import com.ttb.equipment.repository.EquipmentRequestRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDate
import java.util.*

class RequestCommandServiceTest {

    private val repository = mockk<EquipmentRequestRepository>()
    private val service = RequestCommandService(repository)

    private val validDto = CreateEquipmentRequestDto(
        employeeName = "John Doe",
        employeeEmail = "john@example.com",
        department = "IT",
        title = "Need new laptop",
        purpose = "For development",
        requiredDate = LocalDate.now().plusDays(5),
        items = listOf(CreateRequestItemDto("NOTEBOOK", "16GB", 1))
    )

    private fun mockRequest(status: RequestStatus): EquipmentRequest {
        val req = EquipmentRequest(
            requesterId = "user1",
            employeeName = "John Doe",
            employeeEmail = "john@example.com",
            department = "IT",
            title = "Title",
            purpose = "Purpose",
            requiredDate = LocalDate.now().plusDays(5),
            status = status
        )
        req.addItem(RequestItem(equipmentType = "NOTEBOOK", quantity = 1))
        return req
    }

    @Test
    fun `สร้าง Draft สำเร็จและได้ข้อมูลตอบกลับถูกต้อง`() {
        val savedReq = mockRequest(RequestStatus.DRAFT)
        every { repository.save(any()) } returns savedReq

        val result = service.createDraft("user1", validDto)

        assertEquals(RequestStatus.DRAFT, result.status)
        assertEquals("user1", result.requesterId)
        assertEquals(1, result.items.size)
        verify(exactly = 1) { repository.save(any()) }
    }

    @Test
    fun `Submit จาก DRAFT เปลี่ยนเป็น PENDING สำเร็จ`() {
        val requestId = UUID.randomUUID()
        val draftReq = mockRequest(RequestStatus.DRAFT)
        
        every { repository.findById(requestId) } returns Optional.of(draftReq)
        every { repository.save(any()) } answers { firstArg() }

        val result = service.submitRequest(requestId, "user1")
        assertEquals(RequestStatus.PENDING, result.status)
    }

    @Test
    fun `สร้างคำขอโดยไม่มี Item ไม่สำเร็จเมื่อ Submit`() {
        val requestId = UUID.randomUUID()
        val draftReq = mockRequest(RequestStatus.DRAFT).apply { items.clear() }
        
        every { repository.findById(requestId) } returns Optional.of(draftReq)

        val ex = assertThrows<BusinessRuleViolationException> {
            service.submitRequest(requestId, "user1")
        }
        assertEquals("Request must have at least one item", ex.message)
    }

    @Test
    fun `Approve คำขอจากสถานะที่ไม่ใช่ PENDING ไม่สำเร็จ`() {
        val requestId = UUID.randomUUID()
        val draftReq = mockRequest(RequestStatus.DRAFT) // not pending
        
        every { repository.findById(requestId) } returns Optional.of(draftReq)

        val ex = assertThrows<InvalidStatusTransitionException> {
            service.approveRequest(requestId, "approver1")
        }
        assertEquals("Only PENDING requests can be approved", ex.message)
    }

    @Test
    fun `แก้ไข Request ที่ไม่ใช่ DRAFT ไม่สำเร็จ`() {
        val requestId = UUID.randomUUID()
        val pendingReq = mockRequest(RequestStatus.PENDING)
        
        every { repository.findById(requestId) } returns Optional.of(pendingReq)

        val ex = assertThrows<InvalidStatusTransitionException> {
            service.updateDraft(requestId, "user1", validDto)
        }
        assertEquals("Only DRAFT requests can be edited", ex.message)
    }

    @Test
    fun `Version ไม่ตรงกันไม่เขียนทับข้อมูลล่าสุด`() {
        val requestId = UUID.randomUUID()
        val draftReq = mockRequest(RequestStatus.DRAFT).apply { version = 2 }
        
        every { repository.findById(requestId) } returns Optional.of(draftReq)

        // Try to update with version 1
        val dtoWithOldVersion = validDto.copy(version = 1)

        val ex = assertThrows<IllegalStateException> {
            service.updateDraft(requestId, "user1", dtoWithOldVersion)
        }
        assertEquals("The request has been updated by someone else. Please refresh and try again.", ex.message)
        // Verify save is NEVER called
        verify(exactly = 0) { repository.save(any()) }
    }
}
