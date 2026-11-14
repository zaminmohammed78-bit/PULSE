plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.pulse.school"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.pulse.school"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    flavorDimensions += "portal"

    productFlavors {
        create("student") {
            dimension = "portal"
            applicationIdSuffix = ".student"
            manifestPlaceholders["appName"] = "PULSE"
            manifestPlaceholders["portalTitle"] = "Student Portal"
            buildConfigField("String", "PORTAL_TYPE", "\"STUDENT\"")
            buildConfigField("String", "DEFAULT_URL", "\"file:///android_asset/index.html\"")
        }

        create("parent") {
            dimension = "portal"
            applicationIdSuffix = ".parent"
            manifestPlaceholders["appName"] = "PULSE-P"
            manifestPlaceholders["portalTitle"] = "Parent Portal"
            buildConfigField("String", "PORTAL_TYPE", "\"PARENT\"")
            buildConfigField("String", "DEFAULT_URL", "\"file:///android_asset/parent.html\"")
        }

        create("teacher") {
            dimension = "portal"
            applicationIdSuffix = ".teacher"
            manifestPlaceholders["appName"] = "PULSE-T"
            manifestPlaceholders["portalTitle"] = "Teacher Portal"
            buildConfigField("String", "PORTAL_TYPE", "\"TEACHER\"")
            buildConfigField("String", "DEFAULT_URL", "\"file:///android_asset/teacher.html\"")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.swiperefreshlayout)
    implementation(libs.androidx.webkit)
}
