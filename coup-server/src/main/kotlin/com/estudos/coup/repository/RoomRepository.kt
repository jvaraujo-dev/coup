package com.estudos.coup.repository

import com.estudos.coup.model.Room
import org.springframework.data.jpa.repository.JpaRepository

@Suppress("EmptyClassBlock")
interface RoomRepository : JpaRepository<Room, String> {
}
