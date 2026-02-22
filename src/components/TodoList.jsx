import TodoCard from "./TodoCard";
import { AppContext } from "../App";
import { useContext, useEffect } from "react";

const TodoList = ({ openModal }) => {
    const { todos, setTodos, user, groupTodoList, getUserFullName } = useContext(AppContext);

    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const str = String(dateStr).trim();
        const parts = str.split(/[.\-/]/);
        if (parts.length === 3) {
            const [a, b, c] = parts.map(Number);
            if (isNaN(a) || isNaN(b) || isNaN(c)) {
                const parsed = new Date(str);
                return isNaN(parsed.getTime()) ? null : parsed;
            }
            const isIso = parts[0].length === 4;
            const year = isIso ? a : (c < 100 ? 2000 + c : c);
            const month = isIso ? b - 1 : b - 1;
            const day = isIso ? c : a;
            return new Date(year, month, day);
        }
        const parsed = new Date(str);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const sortTodos = (todos) => {
        return [...todos].sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));
    }

    const groupByResponsible = (todos) => {
        return todos.reduce((acc, todo) => {
            const key = getUserFullName(todo.responsible);
            if (!acc[key]) acc[key] = [];
            acc[key].push(todo);
            return acc;
        }, {});
    };

    const groupByExpireDate = (todos) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        weekEnd.setHours(0, 0, 0, 0);

        const groups = { 'На сегодня': [], 'На неделю': [], 'Будущее': [] };

        todos.forEach((todo) => {
            const expire = parseDate(todo.expireDate);
            if (!expire || isNaN(expire.getTime())) {
                groups['Будущее'].push(todo);
                return;
            }
            const expireDay = new Date(expire.getFullYear(), expire.getMonth(), expire.getDate());

            if (expireDay.getTime() === today.getTime() || expireDay.getTime() < today.getTime()) {
                groups['На сегодня'].push(todo);
            } else if (expireDay > today && expireDay <= weekEnd) {
                groups['На неделю'].push(todo);
            } else {
                groups['Будущее'].push(todo);
            }
        });

        return groups;
    };

    const groupTodos = (todos) => {
        const sorted = sortTodos(todos);

        switch (groupTodoList) {
            case 'По ответственным':
                return groupByResponsible(sorted);
            case 'По дате завершения':
                return groupByExpireDate(sorted);
            default:
                return { Все: sorted };
        }
    }
    
    const grouped = todos ? groupTodos(todos) : null;

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/todos`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!res.ok) {
                    console.error('Ошибка при получении задач');
                    return;
                }
                const data = await res.json();
                setTodos(data);
            } catch (err) {
                console.error(err)
            }
        }
        fetchTodos();
    }, [setTodos, grouped]);

    return (
        <div className="todo-wrapper">
            {!grouped ? (
                <p>Загрузка...</p>
            ) : Object.keys(grouped).length === 0 ? (
                <p className="empty-message">Список задач пуст</p>
            ) : (
                Object.entries(grouped).map(([groupName, groupItems]) => {
                    // Фильтруем задачи для текущего пользователя
                    const filteredItems = groupItems.filter(todo =>
                        todo.creator === user.id || todo.responsible === user.id
                    );

                    // Не рендерим группу, если после фильтрации нет задач
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={groupName} className="todo-group">
                            <h3>{groupName}</h3>
                            <ul className="todo-list">
                                {filteredItems.map(todo => (
                                    <TodoCard
                                        key={todo.id}
                                        todo={todo}
                                        openModal={openModal}
                                    />
                                ))}
                            </ul>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default TodoList;
