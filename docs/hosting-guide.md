# Hosting Plan for Contagion System

This document provides a step-by-step plan for hosting the Contagion System, ensuring robust backend control while maintaining seamless connectivity for the live frontend website.

## **Hosting Requirements**

1. **Frontend Hosting:** Deploy the React/TypeScript frontend on a static hosting platform like Netlify.
2. **Backend Hosting:** Deploy the Node.js/Express backend to a hosting solution that allows:
   - Full control over WebSocket and API functionality.
   - Easy integration with Supabase.
3. **Connectivity:** Enable communication between the frontend and backend over the internet.
4. **Scalability and Reliability:** Ensure the system can handle multiple concurrent users.

---

## **Deployment Plan**

### **1. Backend Deployment**

#### **1.1. Hosting Solution**
Use a cloud platform like AWS, DigitalOcean, or Render for the backend. These platforms offer:
- Docker support for containerized deployment.
- Full control over the server environment.
- Scalability for handling WebSocket connections and API calls.

#### **1.2. Steps to Deploy**

1. **Prepare Docker Container:**
   - Create a `Dockerfile` for the backend:
     ```dockerfile
     FROM node:18-alpine

     WORKDIR /app
     
     COPY package*.json ./
     RUN npm install

     COPY . .

     EXPOSE 8080

     CMD ["npm", "start"]
     ```
   - Build and test the Docker image locally:
     ```bash
     docker build -t contagion-backend .
     docker run -p 8080:8080 contagion-backend
     ```

2. **Deploy to Hosting Service:**
   - Push the Docker image to a container registry (e.g., Docker Hub, AWS ECR).
   - Deploy the container to the chosen hosting service.
   - Configure environment variables for the backend:
     ```bash
     PORT=8080
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_key
     ```

3. **Setup Domain and SSL:**
   - Assign a custom domain for the backend (e.g., `api.contagion.com`).
   - Enable HTTPS using SSL certificates.

#### **1.3. Monitoring and Scaling**
- Use tools like PM2 or systemd for process management:
  ```bash
  pm2 start src/dev-server.js --name contagion-backend --max-memory-restart 1G
  ```
- Enable auto-scaling based on CPU/memory usage.

---

### **2. Frontend Deployment**

#### **2.1. Hosting Solution**
Use Netlify for frontend hosting. Netlify offers:
- Easy integration with React/TypeScript projects.
- Continuous Deployment (CD) from GitHub.
- HTTPS support with custom domains.

#### **2.2. Steps to Deploy**

1. **Prepare the Build:**
   - Add backend URLs to `.env`:
     ```bash
     VITE_BACKEND_WS_URL=wss://api.contagion.com
     VITE_BACKEND_HTTP_URL=https://api.contagion.com
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     ```
   - Build the frontend:
     ```bash
     npm run build
     ```

2. **Deploy to Netlify:**
   - Connect the GitHub repository to Netlify.
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in Netlify for backend connectivity.

3. **Setup Domain and SSL:**
   - Assign a custom domain for the frontend (e.g., `contagion.com`).
   - Enable HTTPS using Netlify’s SSL.

---

### **3. Communication Flow**

#### **3.1. Backend to Frontend**
- Ensure CORS settings in the backend allow requests from the frontend domain.
  ```javascript
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://contagion.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  ```

#### **3.2. WebSocket Configuration**
- Use secure WebSocket (`wss://`) for communication.
- Ensure WebSocket server listens on the correct port and URL.

#### **3.3. Frontend Connection**
- Update WebSocket connection in `LiveStream.tsx`:
  ```typescript
  const socket = new WebSocket(import.meta.env.VITE_BACKEND_WS_URL);
  ```

---

### **4. Supabase Integration**

#### **4.1. Database Hosting**
- Ensure Supabase is properly configured to store backend data (e.g., token metrics, simulation states).

#### **4.2. Secure API Keys**
- Store Supabase keys in backend environment variables and restrict access by IP or domain.

---

### **5. Final Checklist**

#### **Frontend:**
- [x] Deployed to Netlify.
- [x] Connected to the backend.
- [x] Custom domain with HTTPS enabled.

#### **Backend:**
- [x] Deployed as a Docker container.
- [x] Custom domain with HTTPS enabled.
- [x] WebSocket and HTTP endpoints tested.

#### **Supabase:**
- [x] Properly configured for data storage.
- [x] Secure API keys in place.

#### **Testing:**
- [x] End-to-end tests for frontend-backend communication.
- [x] Stress tests for WebSocket connections.
- [x] Data integrity checks in Supabase.

---

### **6. Future Considerations**
- Implement CI/CD for both frontend and backend.
- Use a logging service like LogRocket or Sentry for monitoring.
- Explore serverless solutions for scalability.

---

**End of Hosting Plan**

