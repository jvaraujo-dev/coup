import io.gitlab.arturbosch.detekt.Detekt
import io.gitlab.arturbosch.detekt.DetektCreateBaselineTask

plugins {
	kotlin("jvm") version "2.0.21"
	kotlin("plugin.spring") version "2.0.21"
	id("org.springframework.boot") version "3.5.6"
	id("io.spring.dependency-management") version "1.1.7"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
	jacoco
}

group = "com.estudos"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion.set(JavaLanguageVersion.of(21))
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-websocket:3.5.6")
	implementation("org.springframework.boot:spring-boot-starter:3.5.6")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa:3.5.6")
    implementation("org.jetbrains.kotlin:kotlin-reflect:2.0.21")

	testImplementation("org.springframework.boot:spring-boot-starter-test:3.5.6")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5:2.0.21")
    testImplementation("io.mockk:mockk:1.14.6")

	testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.12.2")

	runtimeOnly("com.h2database:h2:2.4.240")

	implementation(kotlin("stdlib-jdk8"))

    detektPlugins("io.nlopez.compose.rules:detekt:0.4.23")
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        freeCompilerArgs.addAll(
            "-Xjvm-default=all",
            "-Xjsr305=strict",
            "-Xannotation-default-target=param-property"
        )
    }
}

jacoco {
	toolVersion = "0.8.13"
}

detekt {
    buildUponDefaultConfig = true // preconfigure defaults
    allRules = false // activate all available (even unstable) rules.
    config.setFrom("$projectDir/config/detekt.yml") // point to your custom config defining rules to run, overwriting default behavior
    baseline = file("$projectDir/config/baseline.xml") // a way of suppressing issues before introducing detekt
}

tasks.withType<Detekt>().configureEach {
    reports {
        html.required.set(true) // observe findings in your browser with structure and code snippets
        xml.required.set(true) // checkstyle like format mainly for integrations like Jenkins
        sarif.required.set(true) // standardized SARIF format (https://sarifweb.azurewebsites.net/) to support integrations with GitHub Code Scanning
        md.required.set(true) // simple Markdown format
    }
}

tasks.withType<Detekt>().configureEach {
    jvmTarget = "21"
}

tasks.withType<DetektCreateBaselineTask>().configureEach {
    jvmTarget = "21"
}
tasks.withType<Test> {
	useJUnitPlatform()
	finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
	dependsOn(tasks.test)
	reports {
		xml.required.set(true)
		html.required.set(true)
	}

	classDirectories.setFrom(
		fileTree( layout.buildDirectory.dir("/classes/kotlin/main")).apply {
			exclude(
				"**/config/**",
				"**/model/**",
				"**/exception/**",
				"**/dto/**",
				"**/CoupApplication*.class",
                "**/request/**",
                "**/response/**",
                "**/repository/**"
			)
		}
	)
}

tasks.jacocoTestCoverageVerification {
	violationRules {
		rule {
			limit {
				// TODO: increase minimum coverage when test are implemented
				minimum = "0.7".toBigDecimal()
			}
		}
	}
}

tasks.check {
	dependsOn(tasks.jacocoTestCoverageVerification)
}