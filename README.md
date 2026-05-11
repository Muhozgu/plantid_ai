# Plant Identification & Research Assistant System

> An AI system that identifies plants by scientific, local, and family names using image inputs. Includes a research assistant chat interface where users can ask questions about taxonomy, plant traits and more.

---

## 📌 Overview

Built to support researchers with fast classification, structured data outputs, and contextual insights. Designed to improve plant identification accuracy and streamline research workflows.

---

## ✨ Features

- User authentication
- Responsive UI
- Real-time notifications
- REST API integration
- Plant Identification
- Research assistant

---

## 🛠 Tech Stack

### Frontend
- React
- Tailwind CSS
- Typescript
- 

### Backend
- Node.js
- Next.js
- Python
- Fast API
- 

### Database
- Postgresql

### Deployment
- Vercel / Render

---

## 📷 Screenshots

### Home Page
<img width="1279" height="827" alt="image" src="https://github.com/user-attachments/assets/a095725e-3dd1-494d-b20e-36c8f63229f8" />

### Login Page
<img width="992" height="735" alt="image" src="https://github.com/user-attachments/assets/b658aa34-ff92-44ec-99f6-a0caf61288ff" />

### Dashboard
<img width="1062" height="825" alt="image" src="https://github.com/user-attachments/assets/3d115682-3083-43db-af8b-e3e9354e4e7e" />

### Main Page
<img width="1071" height="813" alt="image" src="https://github.com/user-attachments/assets/a937b77d-2c05-4feb-8db4-953481ac812a" />

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/Muhozgu/chlorobiota.git
```

Go to the project folder:

```bash
cd chlorobiota/backend
```
```bash
cd chlorobiota/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

```bash
npm run dev
```

Run the backend:
```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
---

## 📖 Usage

1. Sign up or log in
2. Create navigate to the loggin page
3. Upload an plant image that you would like to identifier
4. Navigate to the research assistant interface
5. Start asking any plant related question based on your goals

---

## 📂 Project Structure

```bash
CHLOROBIOTA
│
├── backend/
│   ├── __pycache__/
│   ├── .venv/
│   ├── venv/
│   ├── .env
│   ├── .gitignore
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── node_modules/
│   ├── src/
│   ├── .env
│   ├── ATTRIBUTIONS.md
│   ├── default_theme.css
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── pnpm-workspace.yaml
│   ├── postcss.config.mjs
│   ├── README.md
│   └── vite.config.ts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8000
GROQ-API-KEY=your_qroq_api_key
```

---

## 🧪 Testing

Run tests using:

```bash
npm test
```

---

## 🔮 Future Improvements

- Add mobile app
- Add a RAG for 200+ pages book
- Add Online Learning features


---

## 🤝 Contributing

Contributions are welcome!

Steps:
1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Your Name

- GitHub: https://github.com/Muhozgu
- LinkedIn: https://linkedin.com/in/muhozgu

---

## ⭐ Support

If you like this project, give it a star on GitHub!
