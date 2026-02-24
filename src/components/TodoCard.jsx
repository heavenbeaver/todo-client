import CalendarIcon from '../icons/CalendarIcon';
import ClockIcon from '../icons/ClockIcon';
import { useContext } from 'react';
import { AppContext } from '../App';

const TodoCard = ({ cardKey, todo, openModal }) => {
    const { title, desc, expireDate, createDate, updateDate, priority, status, creator, responsible } = todo;
    const { getUserFullName, setSelectedTodoId } = useContext(AppContext);
    const currentDate = new Date().toLocaleDateString('ru-RU');

    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('.');
        return new Date(year, month - 1, day); // month - 1 так как месяцы с 0
    }

    // Сравнение
    const expireDateObj = parseDate(expireDate);
    const currentDateObj = parseDate(currentDate);

    return (
        <li className="todo-card" key={cardKey} onClick={() => {openModal('edit'); setSelectedTodoId(todo.id)}}>
            <div className="todo-card-header">
                <h3 className={`todo-title ${status == 'Выполнена' && 'title-green'} ${expireDateObj < currentDateObj && status !== 'Выполнена' && 'title-red'}`}>{title}</h3>
                <div className="todo-badges">
                    <span className="badge priority-high">{priority}</span>
                    <span className="badge status-new">{status}</span>
                </div>
            </div>

            <p className="todo-description">{desc}</p>

            <div className="todo-meta">
                <div className="meta-item">
                    <CalendarIcon />
                    <span>Создана: {createDate}</span>
                </div>

                <div className="meta-item">
                    <CalendarIcon />
                    <span>Срок выполнения до: {expireDate}</span>
                </div>

                <div className="meta-item">
                    <ClockIcon />
                    <span>Обновлено: {updateDate}</span>
                </div>
            </div>

            <div className="todo-footer">
                <div className="user-info">
                    <span className="user-label">Создатель:</span>
                    <span className="user-name">{getUserFullName(creator)}</span>
                </div>
                <div className="user-info">
                    <span className="user-label">Ответственный:</span>
                    <span className="user-name">{getUserFullName(responsible)}</span>
                </div>
            </div>
        </li>
    );
}

export default TodoCard;