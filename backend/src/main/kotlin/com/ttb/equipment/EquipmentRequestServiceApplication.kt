package com.ttb.equipment

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching

@SpringBootApplication
@EnableCaching
class EquipmentRequestServiceApplication

fun main(args: Array<String>) {
	runApplication<EquipmentRequestServiceApplication>(*args)
}
