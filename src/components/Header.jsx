import { useContext, useState } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";
const URL = import.meta.env.VITE_SERVER_URL;

const Header = () => {
    const { user, setUser } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const handleLogout = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${URL}/auth/logout`, {
                method: 'POST'
            })
            if (!res.ok) {
                return
            }
            if (res.status == 204) {
                localStorage.removeItem('token');
                setUser(null);
                navigate('/login', { replace: true });
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error)
        }
    }
    return (
        <div className="header">
            <div className="header__logo">
                Cosmos ToDo
            </div>
            <div className="header__user">
                {user && <div className="user__name">{`${user.lastName} ${user.name} ${user.patronymic}`}</div>}
                <button className="btn btn-primary"
                    disabled={isLoading}
                    onClick={handleLogout}>
                    {isLoading ? 'Выход...' : 'Выйти'}
                </button>
            </div>
        </div>);
}

export default Header;