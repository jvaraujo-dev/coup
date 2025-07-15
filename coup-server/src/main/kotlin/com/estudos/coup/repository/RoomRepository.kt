package com.estudos.coup.repository

import com.estudos.coup.model.Room
import org.springframework.data.jpa.repository.JpaRepository

interface RoomRepository : JpaRepository<Room, String> {
}