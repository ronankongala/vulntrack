pipeline {
    agent any
    tools {
        maven 'maven-3'
        nodejs 'node-24'
    }
    stages {
        stage('Checkout') {
            steps {
                echo 'Using local workspace, no remote checkout yet.'
                // The project is bind-mounted read-only into the Jenkins container at /workspace/vulntrack.
                // Replace this with `checkout scm` once the repo is pushed.
                deleteDir()
                sh '''
                    tar -C /workspace/vulntrack \
                        --exclude=./frontend/node_modules --exclude=./frontend/dist \
                        --exclude=./backend/target --exclude=./.claude \
                        -cf - . | tar -xf -
                '''
            }
        }
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
        stage('Test') {
            steps {
                dir('frontend') {
                    sh 'npx tsc -b'
                }
                dir('backend') {
                    // Postgres runs on the Docker host, not inside the Jenkins container.
                    withEnv(['SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/vulntrack']) {
                        sh 'mvn test'
                    }
                }
            }
        }
        stage('SonarQube Analysis') {
            environment {
                SCANNER_HOME = tool 'sonar-scanner'
            }
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        "$SCANNER_HOME/bin/sonar-scanner" \
                            -Dsonar.projectKey=VulnTrack \
                            -Dsonar.projectName=VulnTrack \
                            -Dsonar.sources=backend/src/main/java,frontend/src \
                            -Dsonar.tests=backend/src/test/java \
                            -Dsonar.java.binaries=backend/target/classes \
                            -Dsonar.java.test.binaries=backend/target/test-classes
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                // Relies on the SonarQube webhook to Jenkins; the timeout keeps a missing webhook from hanging the build.
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Package') {
            steps {
                archiveArtifacts artifacts: 'backend/target/*.jar', fingerprint: true
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
            }
        }
    }
}
