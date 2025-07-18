package com.estudos.coup.controller

import com.estudos.coup.controller.request.RoomRequest
import com.estudos.coup.controller.response.RoomResponse
import com.estudos.coup.model.toRoomResponse
import com.estudos.coup.services.MatchService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
class MatchmakingController(
    private val matchService: MatchService
) {
    @PostMapping("/create-room")
    @ResponseStatus(HttpStatus.CREATED)
    fun createRoom(@RequestBody roomParameters: RoomRequest): RoomResponse{
        val roomResponse = matchService.createRoom(roomName = roomParameters.roomName).toRoomResponse();
        return roomResponse;
    }
}