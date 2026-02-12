package com.estudos.coup.controller

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.model.toRoomResponse
import com.estudos.coup.service.MatchService
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private const val COOKIE_AGE = 86400

@RestController
@CrossOrigin(origins = ["\${cors.allowed-origins}"])
class MatchmakingController(
    private val matchService: MatchService
) {
    @PostMapping("/create-room")
    @ResponseStatus(HttpStatus.CREATED)
    fun createRoom(
        @RequestBody roomParameters: RoomRequest,
        response: HttpServletResponse,
        @CookieValue(value = "user_session", required = false) sessionCookie: String?
    ): ValidRoomResponse {

        val userId = sessionCookie ?: UUID.randomUUID().toString()

        val cookie = Cookie("user_session", userId)
        cookie.isHttpOnly = true
        cookie.path = "/"
        cookie.maxAge = COOKIE_AGE
        response.addCookie(cookie)

        val roomResponse = matchService.createRoom(roomParameters, userId).toRoomResponse()
        return roomResponse;
    }
}
