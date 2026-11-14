package com.pulse.school

import android.os.Bundle

class StudentPortalActivity : MainActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        portalName = "PULSE"
        targetUrl = "file:///android_asset/index.html"
        super.onCreate(savedInstanceState)
    }
}
