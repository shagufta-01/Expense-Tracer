package com.madaraltasis.expensetracker

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

// Room Entities

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val role: String,
    val phone: String?,
    val language: String?,
    val avatar: String?
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val amount: Double,
    val amountHalalas: Int,
    val currency: String,
    val date: String,
    val description: String,
    val categoryId: String,
    val paidBy: String,
    val groupId: String,
    val jobId: String?,
    val splitType: String,
    val status: String,
    val approvedBy: String?,
    val reviewComment: String?,
    val createdBy: String,
    val createdAt: String,
    val updatedAt: String
)

@Entity(tableName = "settlements")
data class SettlementEntity(
    @PrimaryKey val id: String,
    val fromUser: String,
    val toUser: String,
    val amount: Double,
    val amountHalalas: Int,
    val method: String,
    val note: String,
    val date: String,
    val createdBy: String,
    val createdAt: String
)

// DAOs

@Dao
interface UserDao {
    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsers(users: List<UserEntity>)
}

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY date DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)
}

@Dao
interface SettlementDao {
    @Query("SELECT * FROM settlements ORDER BY date DESC")
    fun getAllSettlements(): Flow<List<SettlementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSettlement(settlement: SettlementEntity)
}

// Database

@Database(entities = [UserEntity::class, ExpenseEntity::class, SettlementEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun expenseDao(): ExpenseDao
    abstract fun settlementDao(): SettlementDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "madar_expense_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
