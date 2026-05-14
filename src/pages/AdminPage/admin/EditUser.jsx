import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../App";
import ArrowBackIcon from "../../../icons/ArrowBackIcon";
import EditUserFormSkeleton from "../../../components/Skeletons/EditUserFormSkeleton";

const defaultFormData = {
    name: '',
    lastName: '',
    patronymic: '',
    login: '',
    head: null,
    isAdmin: false
}

const EditUser = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState(defaultFormData);
    const { user, users, getUserFullName, setRefetch } = useContext(AppContext);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [passwordError, setPasswordError] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    })

    const navigate = useNavigate();

    const fetchUserData = async () => {
        if (!id) return;

        setIsLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/${id}`, {
                method: 'GET'
            });

            const userData = await res.json();

            setFormData({
                name: userData.name,
                lastName: userData.lastName,
                patronymic: userData.patronymic,
                login: userData.login,
                head: userData.head || null,
                isAdmin: userData.isAdmin
            })

        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [id])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        })
    }

    const handleChangePass = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку при изменении
        setPasswordError('');
    }

    const handlePasswordChange = async() => {
        // Валидация
        if (!passwordData.currentPassword) {
            setPasswordError('Введите текущий пароль');
            return false;
        }

        if (!passwordData.newPassword) {
            setPasswordError('Введите новый пароль');
            return false;
        }

        // if (passwordData.newPassword.length < 6) {
        //     setPasswordError('Новый пароль должен содержать минимум 6 символов');
        //     return false;
        // }

        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/${id}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Неверный текущий пароль');
            }

            // Очищаем поля пароля после успешной смены
            setPasswordData({
                currentPassword: '',
                newPassword: ''
            });

            return true;
        } catch (error) {
            setPasswordError(error.message);
            return false;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    head: formData.head === '' ? null : formData.head
                })
            });

            // Если заполнены поля пароля - меняем пароль
            if (passwordData.currentPassword || passwordData.newPassword) {
                const passwordSuccess = await handlePasswordChange();
                if (!passwordSuccess) {
                    // Если ошибка смены пароля, но данные обновлены
                    setError('Данные обновлены, но не удалось сменить пароль');
                    setSaving(prev => !prev);
                    return;
                }
            }

            if (res.ok) {
                setRefetch(prev => !prev);
                navigate('/admin/users');
            } else {
                setSaving(false);
                setError(res.statusText);
            }
        } catch (error) {
            setSaving(false);
            console.error(error);
        }
    }

    const handleDelete = async () => {
        const deleteConfirm = confirm('Вы уверены, что хотите удалить этого пользователя?');
        if (!deleteConfirm) return;

        setIsDeleting(true);
        setError(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setRefetch(prev => !prev);
                navigate('/admin/users');
            } else {
                setError(res.statusText);
                console.error(res.statusText)
            }
        } catch (error) {
            setError(error.message)
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="admin-content-header">
                <h1 className="content-header-title">Редактирование пользователя</h1>
                <NavLink to="/admin/users" className="back-link">
                    <ArrowBackIcon />
                    <span>Назад</span>
                </NavLink>
            </div>

            {isLoading && isLoading ? <EditUserFormSkeleton /> :
                <form className="user-edit-form" onSubmit={handleSubmit}>
                    <input type="text" name="lastName" placeholder="Фамилия" value={formData.lastName} onChange={handleChange} required />
                    <input type="text" name="name" placeholder="Имя" value={formData.name} onChange={handleChange} required />
                    <input type="text" name="patronymic" placeholder="Отчество" value={formData.patronymic} onChange={handleChange} />
                    <input type="text" name="login" placeholder="Почта" value={formData.login} onChange={handleChange} required />

                    {(Number(id) != 1) && (
                        <>
                            <label htmlFor="head">Руководитель</label>
                            <select name="head" id="head" value={formData.head ?? ''} onChange={handleChange}>
                                <option value="">Не назначен</option>
                                {users && users.filter(listUser => listUser.id != id).map(user => {
                                    return <option value={user.id} key={user.id}>{getUserFullName(user.id)}</option>
                                })}
                            </select>
                        </>
                    )}

                    {(user.id != id && Number(id) != 1) && (
                        <div className="switch-wrapper">
                            <label htmlFor="adminToggle">Администратор</label>
                            <label className="switch">
                                <input name="isAdmin" type="checkbox" id="adminToggle" checked={formData.isAdmin} onChange={handleChange} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    )}

                    <label htmlFor="current-password">Сменить пароль</label>
                    <input type="password" name="currentPassword" id="current-password" placeholder="Текущий пароль" value={passwordData.currentPassword} onChange={handleChangePass}/>
                    <input type="password" name="newPassword" placeholder="Новый пароль" value={passwordData.newPassword} onChange={handleChangePass} />
                    {passwordError && (
                        <div className="password-error">{passwordError}</div>
                    )}

                    <div className="action-btns">
                        <button className="btn btn-primary" disabled={isSaving} type="submit">{isSaving ? 'Сохранение' : 'Сохранить'}</button>
                        {(user.id != id && Number(id) != 1) && (
                            <button className="btn btn-delete" disabled={isDeleting} type="button" onClick={handleDelete}>
                                {!isDeleting ? 'Удалить пользователя' : 'Удаление...'}
                            </button>
                        )}
                    </div>

                    {error &&
                        <div className="error-message">
                            {error}
                        </div>
                    }
                </form>
            }
        </>
    );
}

export default EditUser;