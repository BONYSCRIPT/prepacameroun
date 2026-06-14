import logo from '../images/prepalogo.png';
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from 'react-router-dom';

const PrepaCard = () => {
  return (
    <Link 
      to='user/dashboard' 
      className='col-12 col-sm-6 col-md-4 d-flex justify-content-center mt-3 mb-4' 
      style={{textDecoration:'none'}}
    >
      <button 
        type="button" 
        className="btn btn-success w-100 d-flex align-items-center justify-content-center justify-content-md-start" 
        style={{columnGap: 'clamp(0.5rem, 1.5vw, 1rem)'}}
      >
        <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center">
          <img 
            src={logo} 
            alt="Prepa" 
            className="img-fluid m-2" 
            style={{width: 'clamp(32px, 5vw, 42px)', height: 'auto'}}
          />
        </div>
        <span className="fw-bold">Concours</span>
      </button>
    </Link>
  );
};

export default PrepaCard;
