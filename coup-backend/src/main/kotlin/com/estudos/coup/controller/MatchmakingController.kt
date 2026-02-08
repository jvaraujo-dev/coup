package com.estudos.coup.controller

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.controller.response.ValidRoomResponse
import com.estudos.coup.model.toRoomResponse
import com.estudos.coup.service.MatchService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@CrossOrigin(origins = ["\${cors.allowed-origins}"])
class MatchmakingController(
    private val matchService: MatchService
) {
    @PostMapping("/create-room")
    @ResponseStatus(HttpStatus.CREATED)
    fun createRoom(@RequestBody roomParameters: RoomRequest): ValidRoomResponse {
        val roomResponse = matchService.createRoom(roomParameters).toRoomResponse()
        return roomResponse;
    }
}
