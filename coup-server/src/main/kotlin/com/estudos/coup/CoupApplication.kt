package com.estudos.coup

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CoupApplication

@Suppress("SpreadOperator")
fun main(args: Array<String>) {
	runApplication<CoupApplication>(*args)
}
