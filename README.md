# AWS Projects Monorepo

## 📖 Overview
This repository is a **monorepo** that contains implementations of projects from [NextWork.org](https://nextwork.org) for practice and skill-building.  
Each project is organized under the `apps/` directory, following a clean monorepo structure for scalability.

---

## 📂 Repository Structure
```
.
├── apps/
│   └── netflix-quicksight/   # Visualize Netflix dataset using AWS CDK + QuickSight
├── package.json
├── tsconfig.json
├── README.md (this file)
```

---

## 🚀 Current Apps

| App Name           | Description                                                                 | Tech Stack                  |
|--------------------|-----------------------------------------------------------------------------|-----------------------------|
| **netflix-quicksight** | Visualize Netflix dataset by integrating **Amazon QuickSight** with **S3** using **AWS CDK**. | AWS CDK, S3, QuickSight     |

---

## 🛠️ Monorepo Notes
- Uses **pnpm** workspaces (or npm/yarn if preferred) for package management.
- Each app is isolated in `apps/` with its own dependencies and CDK stacks.

---
