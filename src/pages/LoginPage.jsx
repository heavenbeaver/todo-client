import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../App";
import LogoIcon from "../icons/LogoIcon";
import AuthBg from "../components/Auth/AuthBg";

const LoginPage = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user, setUser } = useContext(AppContext);
    const [isHidePass, setIsHidePass] = useState(true);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    login,
                    password
                })
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                setError(errorData?.error || 'Не удалось выполнить вход. Проверьте логин и пароль.');
                return;
            }

            const data = await res.json();

            if (data) setUser({
                id: data.id,
                login: data.login,
                name: data.name,
                lastName: data.lastName,
                patronymic: data.patronymic,
                isAdmin: data.isAdmin
            })

            navigate('/');
        } catch (error) {
            console.error(error);
            if (error.message == 'Failed to fetch') {
                setError('Сервер недоступен. Попробуйте позже.');
            } else {
                setError('Произошла неизвестная ошибка.Попробуйте снова.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const changePassVisibility = () => {
        setIsHidePass(!isHidePass);
    }

    return (
        <>
            <AuthBg />
            <div className="screen">
                <div className="left">
                    <div className="logo">
                        <div className="logo-icon">
                            <LogoIcon />
                        </div>
                        <div className="logo-wordmark">
                            пульс<span>ар</span>
                        </div>
                    </div>
                    <div className="hero-text">
                        <div className="hero-eyebrow">Система управления тикетами</div>
                        <div className="hero-title">Каждая задача<br /><span>под контролем</span></div>
                        <div className="hero-desc">
                            Отслеживайте, приоритизируйте и решайте задачи команды — всё в одном месте
                        </div>
                    </div>
                    <div className="waveform">
                        <div className="wave-bar" style={{ height: '40%' }}></div>
                        <div className="wave-bar" style={{ height: '70%' }}></div>
                        <div className="wave-bar" style={{ height: '55%' }}></div>
                        <div className="wave-bar" style={{ height: '90%' }}></div>
                        <div className="wave-bar" style={{ height: '65%' }}></div>
                        <div className="wave-bar" style={{ height: '45%' }}></div>
                        <div className="wave-bar" style={{ height: '80%' }}></div>
                        <div className="wave-bar" style={{ height: '60%' }}></div>
                        <div className="wave-bar" style={{ height: '75%' }}></div>
                        <div className="wave-bar" style={{ height: '50%' }}></div>
                        <div className="wave-bar" style={{ height: '35%' }}></div>
                        <div className="wave-bar" style={{ height: '85%' }}></div>
                        <div className="wave-bar" style={{ height: '55%' }}></div>
                        <div className="wave-bar" style={{ height: '70%' }}></div>
                        <div className="wave-bar" style={{ height: '40%' }}></div>
                        <div className="wave-bar" style={{ height: '95%' }}></div>
                        <div className="wave-bar" style={{ height: '60%' }}></div>
                        <div className="wave-bar" style={{ height: '45%' }}></div>
                        <div className="wave-bar" style={{ height: '80%' }}></div>
                        <div className="wave-bar" style={{ height: '65%' }}></div>
                    </div>
                </div>

                <div className="right">

                    <div className="logo">
                        <div className="logo-icon">
                            <LogoIcon />
                        </div>
                        <div className="logo-wordmark">
                            пульс<span>ар</span>
                        </div>
                    </div>
                    <div className="hero-eyebrow">Система управления тикетами</div>

                    <div className="login">

                        <form className="form form-login" onSubmit={handleSubmit}>

                            <h1 className="form-title">Вход</h1>
                            <h3 className="form-desc">Введите данные вашего аккаунта</h3>

                            <label htmlFor="login">Логин</label>
                            <input
                                type="text"
                                name="login"
                                id="login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="user@company.ru"
                                autoComplete="username"
                                required />

                            <label htmlFor="password">Пароль</label>
                            <div className="password-container">
                                <input
                                    type={isHidePass ? 'password' : 'text'}
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    autoComplete="current-password"
                                    required />
                                <div className="show-pass-btn" onClick={changePassVisibility}>
                                    <img width={24} src={isHidePass ? 'show.png' : 'hide.png'} alt="Иконка показать/скрыть пароль" title={isHidePass ? 'Показать пароль' : 'Скрыть пароль'} />
                                </div>
                            </div>

                            <button className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Вход' : 'Войти'}</button>
                            {error && <p className="error-message">Ошибка: {error}</p>}
                        </form>
                        <div className="form-link">
                            <div className="word-or">
                                <span></span>
                                <p>или</p>
                                <span></span>
                            </div>
                            <div className="or-link">
                                <p>Нет аккаунта?</p>
                                <Link to={'/register'}>Создать</Link></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginPage;