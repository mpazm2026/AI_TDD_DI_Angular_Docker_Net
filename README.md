### Tech Stack & AI Tools Comparison

This project was built using **Gemini**, **Copilot Actions**, **Antigravity CLI**, and **Amazon Q Developer (AQD) CLI**. 

#### AI Tools Insights
* **Copilot Actions**: Provided lower-quality code outputs, even when guided by comprehensive `.md` files.
* **Antigravity CLI**: Delivered excellent coding results, but the free tier token quota is highly restrictive (lasting only 1 hour or a few multi-file requests).
* **Gemini**: Consistently provided strong architectural suggestions and a better high-level overview.

#### Architecture & Deployment
* **Backend**: Built with **.NET 10** for Docker practice, utilizing **Dependency Injection (DI)** for decoupling. Deployed on **Render.com**.
* **Frontend**: Built with **Angular** for development practice. Deployed on **Vercel.com**.

#### Docker & Deployment Engineering
Because Render.com does not support .NET natively, a custom `Dockerfile` was required. Standardizing the Docker configuration was challenging due to differing image-creation approaches between Gemini and the local AI agent. 

Three critical adjustments were made to ensure a successful deployment:
1. **Repository Rules**: AQD CLI identified that the `.gitignore` file was inadvertently discarding a required project.
2. **Path Separators**: Updated pathing in `.csproj` files to use Linux-compatible forward slashes (`/`) instead of Windows backslashes (`\`).
3. **Environment Configuration**: Configured `DOTNET_USE_POLLING_FILE_WATCHER=true` to prevent Render's default file-watching behavior from stalling the deployment process.
