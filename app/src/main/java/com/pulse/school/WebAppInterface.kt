package com.pulse.school

import android.content.Context
import android.content.Intent
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val context: Context, private val currentPortal: String) {

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun getPortalType(): String {
        return currentPortal
    }

    @JavascriptInterface
    fun openPortal(portal: String) {
        val intent = when (portal.uppercase()) {
            "STUDENT", "PULSE" -> Intent(context, StudentPortalActivity::class.java)
            "PARENT", "PULSE-P" -> Intent(context, ParentPortalActivity::class.java)
            "TEACHER", "PULSE-T" -> Intent(context, TeacherPortalActivity::class.java)
            else -> Intent(context, PortalSelectionActivity::class.java)
        }
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(intent)
    }

    @JavascriptInterface
    fun shareContent(title: String, text: String) {
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TITLE, title)
            putExtra(Intent.EXTRA_TEXT, text)
        }
        context.startActivity(Intent.createChooser(shareIntent, "Share via"))
    }
}
