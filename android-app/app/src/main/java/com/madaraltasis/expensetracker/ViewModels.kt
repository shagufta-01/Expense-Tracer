package com.madaraltasis.expensetracker

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)

    private val _currentUser = MutableStateFlow<UserEntity?>(null)
    val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

    init {
        // Seed some data or load initial user
        viewModelScope.launch {
            val user = UserEntity("1", "Imtiyaz Alam", "imtiyaz@madaraltasis.com", "owner", null, "en", null)
            db.userDao().insertUser(user)
            _currentUser.value = user
        }
    }

    fun switchUser(role: String) {
        viewModelScope.launch {
            val id = if (role == "owner") "1" else "2"
            val name = if (role == "owner") "Imtiyaz Alam" else "Tariq Khan"
            val email = if (role == "owner") "imtiyaz@madaraltasis.com" else "tariq@madaraltasis.com"
            val user = UserEntity(id, name, email, role, null, "en", null)
            db.userDao().insertUser(user)
            _currentUser.value = user
        }
    }
}
