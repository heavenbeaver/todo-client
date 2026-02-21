import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';
import NotFoundPage from "./pages/NotFoundPage";

export const AppContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(null);
  const [todos, setTodos] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [todoData, setTodoData] = useState(null);
  const [groupTodoList, setGroupTodoList] = useState(localStorage.getItem('groupTodoList') || 'Без группировок');

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setAuthLoading(false)
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await res.json();
      setUser(data); // сохраняем пользователя в контексте
    } catch (err) {
      console.error('Fetch /auth/me error:', err);
      // localStorage.removeItem('token');
      // setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users`, {
          method: 'GET'
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err)
      };
    }

    fetchUsers();

  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Функция для получения ФИО по ID
  const getUserFullName = (userId) => {
    if (!users || !userId) return 'Не назначен';

    const user = users.find(u => u.id === userId);
    if (!user) return `ID: ${userId}`;

    const fullName = [
      user.lastName,
      user.name,
      user.patronymic
    ].filter(Boolean).join(' ');

    return fullName;
  };

  if (authLoading) {
    return (
      <div className="loader-wrapper">
        <Loader />
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ user, setUser, todos, setTodos, users, setUsers, getUserFullName, editMode, setEditMode, selectedTodoId, setSelectedTodoId, todoData, setTodoData, groupTodoList, setGroupTodoList }}>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  )
}

export default App
