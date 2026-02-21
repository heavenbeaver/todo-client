import { forwardRef, useState, useContext, useEffect, useMemo } from "react";
import CrossIcon from '../icons/CrossIcon';
import { AppContext } from "../App";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Russian } from "flatpickr/dist/l10n/ru";

const Modal = forwardRef(({ closeModal }, ref) => {
    const { user, users, getUserFullName, editMode, selectedTodoId, todoData, setTodoData } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [expireDate, setExpireDate] = useState('');
    const [priority, setPriority] = useState('Высокий');
    const [responsible, setResponsible] = useState('');
    const [status, setStatus] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const currentDate = new Date().toLocaleDateString('ru-RU');

        const formData = {
            title,
            desc,
            expireDate,
            createDate: currentDate,
            updateDate: currentDate,
            priority,
            status: 'К выполнению',
            creator: user.id,
            responsible: responsible || user.id
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                console.log(res)
            }

            // сброс формы
            setLoading(false);
            setTitle('');
            setDesc('');
            setExpireDate('');
            setPriority('Высокий');
            setResponsible(user.id);

            closeModal();
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteTodo = async (e) => {
        e.preventDefault();
        setDeleting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/todos/${selectedTodoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                setDeleting(false)
                console.error('Ошибка при удалении задачи');
                return;
            }

            setDeleting(false);
            closeModal();
        } catch (err) {
            setDeleting(false)
            console.error(err)
        }
    }

    useEffect(() => {
        if (!selectedTodoId) return;
        const fetchTodoData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/todos/${selectedTodoId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!res.ok) {
                    console.error('Ошибка при получении задачи');
                    return;
                }

                const data = await res.json();
                setTodoData(data);
            } catch (err) {
                console.error(err)
            }
        }
        fetchTodoData();
    }, [selectedTodoId, setTodoData]);

    useEffect(() => {
        if (editMode === 'edit') {
            setTitle(todoData.title);
            setDesc(todoData.desc);
            setExpireDate(todoData.expireDate);
            setPriority(todoData.priority);
            setResponsible(todoData.responsible);
            setStatus(todoData.status);
        }
    }, [todoData]);

    useEffect(() => {
        if (editMode === 'create') {
            setTitle('');
            setDesc('');
            setExpireDate('');
            setPriority('Высокий');
            setResponsible(user?.id || '');
            setStatus('К выполнению');
        }
    }, [editMode, user]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const currentDate = new Date().toLocaleDateString('ru-RU');

        const formData = {
            title,
            desc,
            expireDate,
            updateDate: currentDate,
            priority,
            status,
            responsible: responsible || user.id
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/todos/${todoData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                console.log(res)
            }
            setLoading(false);
            closeModal();
        } catch (error) {
            console.log(error)
        }
    }

    const canEditFields = () => {
        if (!todoData || !user) return false;

        return (
            todoData.creator === user.id ||
            todoData.creator === user.head
        );
    };

    const canEdit = canEditFields();

    const pickerOptions = useMemo(() => ({
        locale: Russian,
        dateFormat: "d.m.Y"
    }), []);

    return (
        <div ref={ref} className="modal">
            {editMode === 'create' ?
                <form className="todo-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">Создание задачи</h2>
                    <input type="text" name="title" id="title" value={title} placeholder="Название" onChange={(e) => setTitle(e.target.value)} />
                    <textarea placeholder="Описание задачи" name="desc" id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} required></textarea>
                    <Flatpickr
                        value={expireDate}
                        options={pickerOptions}
                        placeholder="Срок выполнения до:"
                        onChange={(selectedDates, dateStr) => {
                            setExpireDate(dateStr);
                        }}
                    />
                    <label htmlFor="priority">Приоритет:</label>
                    <select name="priority" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Высокий">Высокий</option>
                        <option value="Средний">Средний</option>
                        <option value="Низкий">Низкий</option>
                    </select>
                    <label htmlFor="responsible">Ответственный за выполнение:</label>
                    <select name="responsible" id="responsible" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
                        <option value={user.id}>{getUserFullName(user.id)}</option>
                        {users && users.filter(item => item.head == user.id).map(user => {
                            return <option key={user.id} value={user.id}>{getUserFullName(user.id)}</option>
                        })}
                    </select>
                    <button className="btn btn-primary" disabled={loading}>{loading ? 'Отправка...' : 'Создать задачу'}</button>
                </form>
                :
                <form className="todo-form" onSubmit={handleEditSubmit}>
                    <h2 className="form-title">Редактирование задачи</h2>
                    <input disabled={!canEdit} type="text" name="title" id="title" value={title} placeholder="Название" onChange={(e) => setTitle(e.target.value)} />
                    <textarea disabled={!canEdit} placeholder="Описание задачи" name="desc" id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} required></textarea>
                    <Flatpickr
                        value={expireDate}
                        disabled={!canEdit}
                        options={pickerOptions}
                        placeholder="Срок выполнения до:"
                        onChange={(selectedDates, dateStr) => {
                            setExpireDate(dateStr);
                        }}
                    />
                    <label htmlFor="priority">Приоритет:</label>
                    <select disabled={!canEdit}  name="priority" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="Высокий">Высокий</option>
                        <option value="Средний">Средний</option>
                        <option value="Низкий">Низкий</option>
                    </select>
                    <label htmlFor="responsible">Ответственный за выполнение:</label>
                    <select disabled={!canEdit} name="responsible" id="responsible" value={responsible} onChange={(e) => setResponsible(e.target.value)}>
                        <option value={todoData && todoData.responsible}>{getUserFullName(todoData && todoData.responsible)}</option>
                        {users && users.filter(item => item.head == user.id).map(user => {
                            return <option key={user.id} value={user.id}>{getUserFullName(user.id)}</option>
                        })}
                    </select>
                    <label htmlFor="status">Статус:</label>
                    <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value='К выполнению'>К выполнению</option>
                        <option value='Выполняется'>Выполняется</option>
                        <option value='Выполнена'>Выполнена</option>
                        <option value='Отменена'>Отменена</option>
                    </select>
                    <button className="btn btn-primary" disabled={loading}>{loading ? 'Отправка...' : 'Сохранить'}</button>
                    { canEdit && <button className="btn btn-delete" disabled={deleting} onClick={handleDeleteTodo}>{deleting ? 'Удаление' : 'Удалить'}</button>}
                </form>
            }
            <button className="btn-close" onClick={closeModal}><CrossIcon /></button>
        </div>
    );
})

export default Modal;