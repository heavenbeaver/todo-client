import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../App";

const ProtectedRoute = ({children}) => {
    const {user} = useContext(AppContext);

    if (!user) {
        return <Navigate to='/login' replace />
    }

    return children;
};

export default ProtectedRoute;