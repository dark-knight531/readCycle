# readCycle 📚

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

A full-stack, peer-to-peer web application designed to help university students map, donate, and exchange academic textbooks. readCycle aims to reduce educational expenses by connecting students directly with campus peers who have the materials they need.

**🌍 Live Demo:** [readcycle.vercel.app](https://readcycle-jade.vercel.app) 

---

## ✨ Key Features

* **Role-Based Listings:** Users can seamlessly toggle between donating books for free or listing them for sale with dynamic pricing inputs.
* **Secure Authentication Pipeline:** Bypasses traditional cross-site cookie restrictions using a robust JWT Bearer token architecture stored locally and attached via secure Axios interceptors.
* **Complex Media Handling:** Supports direct image uploads for book covers using `FormData` parsing and custom header stripping.
* **Location Mapping:** Optional browser geolocation integration to attach GPS coordinates (longitude/latitude) to specific textbook pick-up points.
* **Decoupled Architecture:** Frontend and backend are completely isolated, utilizing strict CORS policies to ensure secure cross-origin resource sharing between cloud environments.

## 🛠️ Tech Stack

**Frontend:**
* React.js (via Vite)
* Tailwind CSS for responsive UI
* React Router DOM for single-page routing
* Axios for asynchronous network requests

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose (Schema modeling)
* JSON Web Tokens (JWT) for secure session management
* `multer` / `cloudinary` (for image processing)

**Deployment:**
* Frontend hosted on **Vercel**
* Backend server hosted on **Render**

---
🔒 Security Implementations
* Proxy Trusting: Express configured to trust proxy to ensure HTTPS protocols pass accurately through Render's load balancers.

* Sanitized Responses: Backend middleware automatically strips sensitive data (passwords, refresh tokens) before attaching user objects to the client request bundle.

* Dynamic CORS: Configured an origin array mapping to actively block unauthorized domains while allowing local testing and Vercel production builds.
