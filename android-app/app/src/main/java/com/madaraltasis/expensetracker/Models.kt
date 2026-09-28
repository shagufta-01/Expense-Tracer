package com.madaraltasis.expensetracker

enum class UserRole {
    owner, staff
}

enum class LanguageCode {
    en, hi, ur, ar
}

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole,
    val phone: String? = null,
    val language: LanguageCode? = null,
    val avatar: String? = null
)

data class Category(
    val id: String,
    val name: String,
    val icon: String,
    val color: String,
    val isActive: Boolean
)

data class Job(
    val id: String,
    val customerName: String,
    val phone: String,
    val applianceType: String,
    val brand: String,
    val location: String,
    val status: String, // 'active' | 'completed' | 'cancelled'
    val notes: String? = null,
    val createdAt: String
)

data class Group(
    val id: String,
    val name: String,
    val description: String,
    val createdAt: String
)

data class ExpenseSplit(
    val userId: String,
    val shareHalalas: Int,
    val shareAmount: Double,
    val percentage: Double? = null
)

data class Expense(
    val id: String,
    val amount: Double,
    val amountHalalas: Int,
    val currency: String,
    val date: String,
    val description: String,
    val categoryId: String,
    val paidBy: String,
    val groupId: String,
    val jobId: String?,
    val splitType: String, // 'equal' | 'custom' | 'percentage' | 'company'
    val status: String, // 'pending' | 'approved' | 'rejected'
    val approvedBy: String? = null,
    val reviewComment: String? = null,
    val createdBy: String,
    val createdAt: String,
    val updatedAt: String
)

data class Settlement(
    val id: String,
    val fromUser: String,
    val toUser: String,
    val amount: Double,
    val amountHalalas: Int,
    val method: String, // 'cash' | 'bank_transfer' | 'stc_pay' | 'urpay' | 'other'
    val note: String,
    val date: String,
    val createdBy: String,
    val createdAt: String
)
