import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [head, setHead] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const URL = import.meta.env.VITE_SERVER_URL;
    const navigate = useNavigate();
    const { user, users, getUserFullName } = useContext(AppContext);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    lastName,
                    patronymic,
                    login,
                    password,
                    head
                })
            });

            if (!res.ok) {
                setIsLoading(false);
                console.error(res.error)
                return;
            }

            setIsLoading(false);
            navigate('/login');
        } catch (error) {
            setIsLoading(false);
            setError(error);
            console.error(error);
        }
    }

    return (
        <div className="login">
            <form className="form form-login" onSubmit={handleSubmit}>
                <h1 className="form-title">Регистрация в ToDo</h1>
                <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" required />
                <input type="text" name="lastName" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Фамилия" required />
                <input type="text" name="patronimic" id="patronumic" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} placeholder="Отчество" required />
                <input type="text" name="login" id="login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Логин" required />
                <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required />
                <label htmlFor="head">Руководитель:</label>
                <select name="head" id="head" onChange={(e) => setHead(e.target.value)}>
                    <option>Нет</option>
                    {users && users.map(user => {
                        return <option key={user.id} value={user.id}>{getUserFullName(user.id)}</option>
                    })}
                </select>
                <button className="btn btn-primary">{isLoading ? 'Отправка...' : 'Зарегистрироваться'}</button>
                {error && <p className="error-message">Ошибка: {error}</p>}
            </form>
            <Link to={'/login'}>Войти</Link>
        </div>
    );
}
 
export default RegisterPage;