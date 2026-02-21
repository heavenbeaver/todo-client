import PlusIcon from "../icons/PlusIcon";

const TodoCreateBtn = ({openModal, setEditMode}) => {
    return (
        <button className="new-todo" onClick={() => {openModal('create'); setEditMode('create')}}><PlusIcon /></button>
    );
}
 
export default TodoCreateBtn;