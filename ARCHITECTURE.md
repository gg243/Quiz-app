# Architecture Summary

This project uses a lightweight deployment model:

- React for the quiz interface
- Docker to package the app
- Nginx to serve the built static files
- GitHub Actions to run tests and deploy automatically
- Amazon ECR to store the Docker image
- AWS EC2 to host the running container
- CloudWatch for basic logging and monitoring

## Flow

1. Code is pushed to the repository.
2. GitHub Actions runs tests and builds the app.
3. A Docker image is created and pushed to ECR.
4. GitHub Actions uses SSM to tell EC2 to pull the latest image.
5. EC2 restarts the container.
6. CloudWatch receives logs and CPU metrics.

## Diagram

```text
Developer → GitHub → GitHub Actions
                           │
                           ├─ Test
                           ├─ Build
                           └─ Deploy
                                 │
                                 ▼
                              Amazon ECR
                                 │
                                 ▼
                              AWS EC2
                                 │
                                 ▼
                             CloudWatch
```

## Goal

Keep the solution easy to understand, easy to deploy, and easy to repeat.
┌──────────────────┐
│  ECS Tasks       │
│  (Private Subnet)│
│  Port 80         │
└──────┬───────────┘
       │ Security Group: Allow 80 from ALB only
       │
       ▼ (Egress)
┌──────────────┐
│  NAT Gateway │  → Internet (for ECR pulls)
└──────────────┘
```

This architecture provides:
- ✅ High availability across 2 AZs
- ✅ Auto-scaling based on demand
- ✅ Secure network isolation
- ✅ Comprehensive monitoring
- ✅ Automated deployments
- ✅ Infrastructure as Code
