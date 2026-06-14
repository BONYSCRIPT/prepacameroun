import { Outlet, Link } from "react-router-dom";

const Home = () => {
    return (
        <>
            <Link to='/'></Link>
            <Outlet />
        </>
    );
}

export default Home;