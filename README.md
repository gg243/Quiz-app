# Quiz App Deployment & Operations Guide

This project is a React quiz application with a simple, automated AWS deployment.

Live site: http://35.74.76.225

## Architecture Overview

- React app for the UI
- Docker for containerization
- Nginx for serving the built static files
- Terraform for infrastructure as code
- GitHub Actions for CI/CD automation
- Amazon ECR for storing the Docker image
- AWS EC2 for running the container
- CloudWatch for logs and basic monitoring

## Deployment Flow

1. Push code to the main branch.
2. GitHub Actions runs tests and builds the app.
3. GitHub Actions builds and pushes a Docker image to ECR.
4. GitHub Actions uses SSM to tell EC2 to pull the latest image.
5. EC2 restarts the container automatically.
6. CloudWatch receives container logs.

## Project Structure

- src/ — React source code
- Dockerfile — production container build
- nginx.conf — static file server config
- .github/workflows/ci-cd.yml — CI/CD pipeline
- terraform/ — AWS infrastructure files
- assets/architecture.svg — architecture diagram source
- assets/architecture.png — generated architecture diagram image
  

## Local Development

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Build locally:

```bash
npm run build
```

## Docker

Build the container:

```bash
docker build -t quiz-app .
```

Run it locally:

```bash
docker run -p 8080:80 quiz-app
```

## Terraform

The Terraform configuration provisions:

- ECR repository
- EC2 instance
- IAM role and instance profile
- Security group
- CloudWatch log group
- CloudWatch CPU alarm

## CI/CD Pipeline

The GitHub Actions workflow performs:

- dependency install
- test execution
- production build
- Docker image build and push to ECR
- deployment to EC2 using SSM

## Monitoring and Logging

This setup provisions a CloudWatch log group and a CloudWatch CPU alarm for the EC2 host. The container itself is run with the default Docker logging (viewable via `docker logs quiz-app`).

If you want CloudWatch container logs, you can re-enable the `awslogs` driver once the EC2 host Docker version supports the required options.

## Design Decisions

- Single EC2 instance keeps the setup simple and easy to explain.
- Docker makes deployment repeatable.
- GitHub Actions removes the need for a separate CI server.
- Nginx serves the built React app efficiently.

## Limitations

- No custom domain or HTTPS certificate.
- No load balancer or autoscaling.
- Basic monitoring only.

## Possible Improvements

- add HTTPS with ACM
- add a load balancer
- add autoscaling
- add richer CloudWatch dashboards and alarms
- add end-to-end tests




## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd recruitment\ task
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Access at: http://localhost:5173

4. **Run tests**
   ```bash
   npm test
   ```

### Docker Local Testing

1. **Build Docker image**
   ```bash
   docker build -t quiz-app .
   ```

2. **Run container**
   ```bash
   docker run -p 8080:80 quiz-app
   ```
   Access at: http://localhost:8080

3. **Using Docker Compose**
   ```bash
   docker-compose up
   ```

## 🚢 Deployment Guide
*All documentation is now maintained in this README. No external PDF guides or screenshots are required or generated.*

### Step 1: Prepare AWS Account

1. **Create S3 bucket for Terraform state**
   ```bash
   aws s3 mb s3://quiz-app-terraform-state --region us-east-1
   aws s3api put-bucket-versioning \
     --bucket quiz-app-terraform-state \
     --versioning-configuration Status=Enabled
   ```

2. **Create DynamoDB table for state locking**
   ```bash
   aws dynamodb create-table \
     --table-name terraform-state-lock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

### Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

```
AWS_ACCESS_KEY_ID: <your-access-key>
AWS_SECRET_ACCESS_KEY: <your-secret-key>
```

**To add secrets:**
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret

### Step 3: Deploy Infrastructure with Terraform

1. **Initialize Terraform**
   ```bash
   cd terraform
   terraform init
   ```

2. **Review the plan**
   ```bash
   terraform plan
   ```

3. **Apply infrastructure**
   ```bash
   terraform apply
   ```
   Type `yes` when prompted.

4. **Note the outputs**
   ```bash
   terraform output
   ```
   Save the ALB DNS name and ECR repository URL.

### Step 4: Initial Docker Image Push

1. **Authenticate Docker to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   ```

2. **Build and push initial image**
   ```bash
   docker build -t quiz-app .
   docker tag quiz-app:latest <ecr-repo-url>:latest
   docker push <ecr-repo-url>:latest
   ```

### Step 5: Trigger CI/CD Pipeline

Push to main branch to trigger automatic deployment:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### Step 6: Verify Deployment

1. **Check ECS Service**
   ```bash
   aws ecs describe-services \
     --cluster quiz-app-cluster \
     --services quiz-app-service
   ```

2. **Access Application**
   - Get ALB DNS: `terraform output alb_dns_name`
   - Open in browser: `http://<alb-dns-name>`

3. **Check Logs**
   ```bash
   aws logs tail /ecs/quiz-app --follow
   ```

## 🔄 CI/CD Pipeline

### Pipeline Stages

The GitHub Actions pipeline consists of 3 main stages:

#### 1. Test Stage
- Checkout code
- Install dependencies
- Run unit tests
- Build application

#### 2. Build & Push Stage
- Build Docker image
- Tag with commit SHA and 'latest'
- Scan for vulnerabilities (Trivy)
- Push to Amazon ECR

#### 3. Deploy Stage
- Download current task definition
- Update with new image
- Deploy to ECS
- Wait for service stability
- Verify deployment

### Pipeline Triggers

- **Push to `main`**: Full pipeline (test → build → deploy)
- **Push to `develop`**: Test and build only
- **Pull Request to `main`**: Test only

### Manual Deployment

To manually deploy without pushing code:

```bash
# Update ECS service to force new deployment
aws ecs update-service \
  --cluster quiz-app-cluster \
  --service quiz-app-service \
  --force-new-deployment
```

## 📊 Monitoring & Logging

### CloudWatch Dashboard

Access the CloudWatch dashboard:
1. AWS Console → CloudWatch → Dashboards
2. Select `quiz-app-dashboard`

**Metrics Available:**
- ECS CPU Utilization
- ECS Memory Utilization
- ALB Response Time
- Request Count
- Healthy/Unhealthy Target Count

### CloudWatch Alarms

**Configured Alarms:**
- High CPU (>80% for 10 minutes)
- High Memory (>85% for 10 minutes)
- High Response Time (>2s for 10 minutes)
- Unhealthy Targets

### Viewing Logs

**Via AWS Console:**
```
CloudWatch → Log Groups → /ecs/quiz-app
```

**Via AWS CLI:**
```bash
# Tail logs in real-time
aws logs tail /ecs/quiz-app --follow

# Get recent logs
aws logs tail /ecs/quiz-app --since 1h
```

### Log Retention

- Logs are retained for 7 days
- Automatically rotated
- Organized by ECS task

## 🎯 Design Decisions

### 1. **React + Vite**
   - **Why**: Fast build times, modern tooling, excellent DX
   - **Alternative**: Create React App (slower, less modern)

### 2. **Docker Multi-Stage Build**
   - **Why**: Smaller image size (~25MB vs ~500MB), security
   - **Stages**: Builder (Node) → Production (Nginx)

### 3. **AWS ECS Fargate**
   - **Why**: Serverless (no EC2 management), auto-scaling, cost-effective
   - **Alternative**: EC2 (more control, more maintenance)

### 4. **Nginx as Web Server**
   - **Why**: High performance, small footprint, production-ready
   - **Features**: Gzip compression, security headers, health checks

### 5. **Terraform for IaC**
   - **Why**: Declarative, version control, reusable, cloud-agnostic
   - **Alternative**: CloudFormation (AWS-specific, verbose)

### 6. **GitHub Actions**
   - **Why**: Native GitHub integration, free for public repos, simple YAML
   - **Alternative**: Jenkins (more complex setup, self-hosted)

### 7. **Application Load Balancer**
   - **Why**: Layer 7 routing, health checks, SSL termination
   - **Alternative**: Network Load Balancer (Layer 4, less features)

### 8. **Private Subnets for ECS**
   - **Why**: Security best practice, no direct internet exposure
   - **NAT Gateway**: Required for ECS to pull images from ECR

### 9. **Auto Scaling**
   - **Why**: Handle traffic spikes, cost optimization
   - **Metrics**: CPU and Memory based scaling

### 10. **CloudWatch Integration**
   - **Why**: Native AWS service, comprehensive monitoring
   - **Alternative**: Datadog, New Relic (additional cost)

## 📝 Assumptions

1. **AWS Account**: You have an AWS account with necessary permissions
2. **Domain**: Using ALB DNS (not custom domain)
3. **SSL**: Not configured (would require ACM certificate + Route53)
4. **Database**: Not required for this quiz app (static data)
5. **Region**: us-east-1 (can be changed in variables)
6. **Cost**: Assuming development/demo usage (not production-scale)
7. **Secrets**: No sensitive data in the app
8. **Authentication**: No user authentication required
9. **State Storage**: Terraform state in S3 (team collaboration)
10. **High Availability**: 2 AZs, 2 tasks minimum

## ⚠️ Limitations & Future Improvements

### Current Limitations

1. **No HTTPS**: Currently HTTP only
   - **Impact**: Not production-ready for sensitive data
   - **Fix**: Add ACM certificate + Route53 domain

2. **No WAF**: No Web Application Firewall
   - **Impact**: Vulnerable to common web attacks
   - **Fix**: Add AWS WAF rules

3. **No CDN**: Static assets served from containers
   - **Impact**: Higher latency for global users
   - **Fix**: Add CloudFront distribution

4. **Basic Monitoring**: Limited custom metrics
   - **Impact**: Less visibility into app performance
   - **Fix**: Add custom application metrics

5. **No Backup**: No automated backups
   - **Impact**: Risk of data loss (though app is stateless)
   - **Fix**: Add backup strategy if stateful

6. **Single Region**: Deployed in one AWS region
   - **Impact**: No disaster recovery
   - **Fix**: Multi-region deployment

### Future Improvements

#### Security Enhancements
- [ ] Implement HTTPS with ACM certificate
- [ ] Add AWS WAF with OWASP rules
- [ ] Implement secrets management with AWS Secrets Manager
- [ ] Add VPC Flow Logs for network monitoring
- [ ] Enable AWS Config for compliance
- [ ] Implement least-privilege IAM policies

#### Performance Optimizations
- [ ] Add CloudFront CDN for global distribution
- [ ] Implement Redis cache for API responses
- [ ] Enable HTTP/2 and HTTP/3
- [ ] Optimize Docker image size further
- [ ] Add application performance monitoring (APM)

#### Reliability Improvements
- [ ] Multi-region deployment with Route53 failover
- [ ] Implement blue-green deployment strategy
- [ ] Add canary deployments
- [ ] Implement circuit breaker pattern
- [ ] Add database read replicas (if needed)

#### Observability
- [ ] Add distributed tracing (AWS X-Ray)
- [ ] Implement structured logging
- [ ] Add custom application metrics
- [ ] Create runbooks for common issues
- [ ] Add synthetic monitoring

#### CI/CD Enhancements
- [ ] Add integration tests
- [ ] Implement end-to-end tests
- [ ] Add security scanning (SAST/DAST)
- [ ] Automated rollback on failures
- [ ] Add staging environment
- [ ] Implement GitOps with ArgoCD

#### Cost Optimization
- [ ] Implement Spot instances for non-prod
- [ ] Add cost allocation tags
- [ ] Optimize container sizing
- [ ] Implement S3 lifecycle policies
- [ ] Use Reserved Instances for predictable workloads

#### Developer Experience
- [ ] Add local development with docker-compose
- [ ] Implement hot-reloading in containers
- [ ] Add pre-commit hooks
- [ ] Create development documentation
- [ ] Add API documentation (if backend added)

## 📚 Additional Documentation

### Project Structure
```
.
├── src/                    # React application source
│   ├── components/         # React components
│   ├── App.jsx            # Main application
│   ├── quizData.js        # Quiz questions
│   └── *.test.jsx         # Test files
├── terraform/             # Infrastructure as Code
│   ├── main.tf            # Terraform main config
│   ├── vpc.tf             # Network configuration
│   ├── ecs.tf             # ECS resources
│   ├── alb.tf             # Load balancer
│   ├── monitoring.tf      # CloudWatch setup
│   └── variables.tf       # Input variables
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # GitHub Actions pipeline
├── Dockerfile             # Multi-stage Docker build
├── nginx.conf             # Nginx configuration
├── docker-compose.yml     # Local development
└── package.json           # Node dependencies
```

### Useful Commands

**Terraform:**
```bash
terraform fmt              # Format code
terraform validate         # Validate configuration
terraform plan            # Preview changes
terraform apply           # Apply changes
terraform destroy         # Destroy infrastructure
terraform output          # Show outputs
```

**Docker:**
```bash
docker build -t quiz-app .                    # Build image
docker run -p 8080:80 quiz-app               # Run container
docker logs <container-id>                    # View logs
docker exec -it <container-id> sh            # Shell access
```

**AWS CLI:**
```bash
aws ecs list-clusters                        # List clusters
aws ecs list-services --cluster <name>       # List services
aws ecs describe-tasks --cluster <name>      # Task details
aws logs tail /ecs/quiz-app --follow         # Tail logs
```

## 🤝 Contributing

This is a recruitment task project. For production use:
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

Your Name - Recruitment Task 2026

---

## 🆘 Troubleshooting

### Common Issues

**1. ECS Tasks Not Starting**
```bash
# Check service events
aws ecs describe-services --cluster quiz-app-cluster --services quiz-app-service
# Check task logs
aws logs tail /ecs/quiz-app --follow
```

**2. Cannot Access Application**
- Verify security groups allow HTTP (port 80)
- Check target group health
- Verify DNS resolves correctly

**3. Docker Build Fails**
```bash
# Clear Docker cache
docker system prune -a
# Rebuild with no cache
docker build --no-cache -t quiz-app .
```

**4. Terraform Apply Fails**
- Check AWS credentials
- Verify region settings
- Check for resource limits
- Review error messages carefully

**5. CI/CD Pipeline Fails**
- Verify GitHub secrets are set
- Check AWS permissions
- Review pipeline logs in GitHub Actions

## 📞 Support

For issues or questions:
- Check CloudWatch Logs first
- Review Terraform outputs
- Check GitHub Actions logs
- Review this README thoroughly

---

**Last Updated**: May 2026
