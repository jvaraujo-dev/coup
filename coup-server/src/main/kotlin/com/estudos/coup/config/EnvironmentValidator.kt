package com.estudos.coup.config

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class EnvironmentValidator(
    @Value("\${cors.allowed-origins}") private val allowedOrigins: String
) {

    @PostConstruct
    fun validateEnvironmentVariables() {
        logger.info("====================================================================")
        if (allowedOrigins.isNotBlank()) {
            logger.info("Variável de ambiente 'ALLOWED_ORIGINS' carregada com sucesso.")
            logger.info("Valor de 'cors.allowed-origins': $allowedOrigins")
        } else {
            logger.warn("ATENÇÃO: A variável de ambiente 'ALLOWED_ORIGINS' não foi encontrada ou está vazia.")
        }
        logger.info("====================================================================")
    }

    companion object {
        private val logger = LoggerFactory.getLogger(EnvironmentValidator::class.java)
    }
}