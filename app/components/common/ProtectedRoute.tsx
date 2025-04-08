import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";


interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    redirectTo = '/'
}: ProtectedRouteProps) {
    const {currentUser, loading} = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if(!loading && !currentUser) {
            navigate(redirectTo);
        }
    }, [currentUser, loading, navigate, redirectTo]);

    if(loading) {
        return <div>Loading...</div>;
    }

    if(!currentUser) {
        return null;
    }

    return <>{children}</>;
}
