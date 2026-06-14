import { Outlet, Link } from "react-router-dom";

const AdminRedirect = () => {
    return (
        <>
            <Link to='admin'></Link>
            <Outlet />
        </>
    );
}

export default AdminRedirect;