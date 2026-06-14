// AdminDisciplineCard.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const AdminDisciplineCard = ({ discipline, onUpdate, onDelete, onClick }) => {
  return (
    <div className="card m-2" style={{ width: '18rem', height: '48vh', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' }}>
      {discipline.image_url && (
        <img
          src={discipline.image_url ? (discipline.image_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${discipline.image_url}` : discipline.image_url) : ''}
          className="card-img-top"
          alt={discipline.nom}
          style={{ height: '150px', objectFit: 'cover' }}
        />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-header pb-3 bg-white text-center fs-6"><span><b>{discipline.nom}</b></span></h5>
        <div className="description-container flex-grow-1 mt-2 pb-2" style={{ overflow: 'auto', maxHeight: '100px' }}>
          <p className="card-text">{discipline.description}</p>
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between">
            <button className="btn btn-primary" onClick={() => onClick(discipline.id)}>
              Ouvrir
            </button>
            <div>
              <button className="btn btn-warning me-2" onClick={() => onUpdate(discipline)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="btn btn-danger" onClick={() => onDelete(discipline.id)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDisciplineCard;
