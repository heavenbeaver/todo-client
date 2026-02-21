import { AppContext } from "../App";
import { useContext } from "react";


const TodoSort = () => {
    const { groupTodoList, setGroupTodoList } = useContext(AppContext);

    return (
        <div className="todo-sort">
            <h2>Группировка задач</h2>
            <select name="group" id="group" value={groupTodoList} onChange={(e) => { setGroupTodoList(e.target.value); localStorage.setItem('groupTodoList', e.target.value)}}>
                <option value="Без группировок">Без группировок</option>
                <option value="По дате завершения">По дате завершения</option>
                <option value="По ответственным">По ответственным</option>
            </select>
        </div>
    );
}

export default TodoSort;