# Deployment Scripts

## Quick deployment scripts for common tasks

### 1. Initial Setup Script
#!/bin/bash
set -e

echo "🚀 Quiz App - Initial Setup"

# Create S3 bucket for Terraform state
echo "Creating S3 bucket for Terraform state..."
aws s3 mb s3://quiz-app-terraform-state --region us-east-1
aws s3api put-bucket-versioning \
  --bucket quiz-app-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
echo "Creating DynamoDB table for state locking..."
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

echo "✅ Setup complete!"

### 2. Deploy Infrastructure
#!/bin/bash
set -e

echo "🏗️ Deploying Infrastructure with Terraform"

cd terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Show outputs
terraform output

echo "✅ Infrastructure deployed!"

### 3. Build and Push Docker Image
#!/bin/bash
set -e

echo "🐳 Building and pushing Docker image"

# Get ECR repository URL
ECR_REPO=$(terraform output -raw ecr_repository_url)
REGION="us-east-1"

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_REPO

# Build image
docker build -t quiz-app .

# Tag image
docker tag quiz-app:latest $ECR_REPO:latest

# Push image
docker push $ECR_REPO:latest

echo "✅ Image pushed to ECR!"

### 4. Force Deployment
#!/bin/bash
set -e

echo "🔄 Forcing new deployment"

aws ecs update-service \
  --cluster quiz-app-cluster \
  --service quiz-app-service \
  --force-new-deployment

echo "✅ Deployment initiated!"

### 5. View Logs
#!/bin/bash

echo "📋 Viewing application logs"

aws logs tail /ecs/quiz-app --follow

### 6. Clean Up Resources
#!/bin/bash
set -e

echo "🧹 Cleaning up resources"

cd terraform

# Destroy infrastructure
terraform destroy

echo "✅ Resources cleaned up!"

# To use these scripts:
# 1. Save each section to a .sh file
# 2. Make executable: chmod +x script.sh
# 3. Run: ./script.sh
