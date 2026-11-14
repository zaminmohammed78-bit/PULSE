package com.pulse.school

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.pulse.school.databinding.ActivityPortalSelectionBinding

class PortalSelectionActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPortalSelectionBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPortalSelectionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Portal 1: Student Portal (PULSE)
        binding.btnOpenStudent.setOnClickListener {
            launchPortal(StudentPortalActivity::class.java)
        }
        binding.cardStudentPortal.setOnClickListener {
            launchPortal(StudentPortalActivity::class.java)
        }

        // Portal 2: Parent Portal (PULSE-P)
        binding.btnOpenParent.setOnClickListener {
            launchPortal(ParentPortalActivity::class.java)
        }
        binding.cardParentPortal.setOnClickListener {
            launchPortal(ParentPortalActivity::class.java)
        }

        // Portal 3: Teacher Portal (PULSE-T)
        binding.btnOpenTeacher.setOnClickListener {
            launchPortal(TeacherPortalActivity::class.java)
        }
        binding.cardTeacherPortal.setOnClickListener {
            launchPortal(TeacherPortalActivity::class.java)
        }
    }

    private fun launchPortal(activityClass: Class<*>) {
        val intent = Intent(this, activityClass)
        startActivity(intent)
    }
}
