package com.pulse.school

import android.os.Bundle

class ParentPortalActivity : MainActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        portalName = "PULSE-P"
        targetUrl = "file:///android_asset/parent.html"
        super.onCreate(savedInstanceState)
    }
}
