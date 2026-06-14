import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { getAnciensSujetsByDiscipline, createAncienSujet, updateAncienSujet, deleteAncienSujet } from '../../services/firestoreService';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const ancienSujetSchema = Yup.object().shape({
  titre: Yup.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Le titre ne doit contenir que des lettres, des chiffres, des espaces, des tirets et des underscores')
    .required('Le titre est requis'),
  annee: Yup.number()
    .integer('L\'année doit être un nombre entier')
    .min(1900, 'L\'année doit être supérieure à 1900')
    .max(new Date().getFullYear(), `L'année ne peut pas dépasser ${new Date().getFullYear()}`)
    .required('L\'année est requise'),
});

const AncienSujetTab = ({ disciplineId }) => {
  const [anciensSujets, setAnciensSujets] = useState([]);
  const [selectedSujet, setSelectedSujet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newSujetTitle, setNewSujetTitle] = useState('');
  const [newSujetAnnee, setNewSujetAnnee] = useState(new Date().getFullYear());
  const [newSujetErrors, setNewSujetErrors] = useState({});
  const [contenuContent, setContenuContent] = useState('');
  const [corrigeContent, setCorrigeContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [titleError, setTitleError] = useState('');
  const [anneeError, setAnneeError] = useState('');
  const sujetsPerPage = 10;

  const validateNewSujet = () => {
    try {
      ancienSujetSchema.validateSync({ titre: newSujetTitle, annee: newSujetAnnee }, { abortEarly: false });
      return {};
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      return errors;
    }
  };

  const validateField = (name, value) => {
    try {
      ancienSujetSchema.validateSyncAt(name, { [name]: value });
      return '';
    } catch (error) {
      return error.message;
    }
  };

  const fetchAnciensSujets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAnciensSujetsByDiscipline(disciplineId);
      setAnciensSujets(data.sort((a, b) => a.numero_page - b.numero_page));
    } catch (error) {
      toast.error('Erreur lors de la récupération des anciens sujets');
    } finally {
      setIsLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    fetchAnciensSujets();
  }, [fetchAnciensSujets]);

  const handleCreateSujet = async () => {
    const errors = validateNewSujet();
    if (Object.keys(errors).length > 0) {
      setNewSujetErrors(errors);
      return;
    }

    try {
      const newSujet = await createAncienSujet({
        titre: newSujetTitle,
        annee: newSujetAnnee,
        contenu: '',
        corrige: '',
        disciplineId: disciplineId,
        numeroPage: anciensSujets.length + 1
      });
      setAnciensSujets([...anciensSujets, newSujet].sort((a, b) => a.numero_page - b.numero_page));
      setShowModal(false);
      setNewSujetTitle('');
      setNewSujetAnnee(new Date().getFullYear());
      setNewSujetErrors({});
      toast.success('Nouvel ancien sujet créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'ancien sujet');
    }
  };

  const handleSujetSelect = (sujet) => {
    setSelectedSujet(sujet);
    setContenuContent(sujet.contenu || '');
    setCorrigeContent(sujet.corrige || '');
  };

  const handleContenuChange = (content) => {
    setContenuContent(content);
  };

  const handleCorrigeChange = (content) => {
    setCorrigeContent(content);
  };

  const handleSaveSujet = async () => {
    if (selectedSujet) {
      const titleValidation = validateField('titre', selectedSujet.titre);
      const anneeValidation = validateField('annee', selectedSujet.annee);

      if (titleValidation || anneeValidation) {
        setTitleError(titleValidation);
        setAnneeError(anneeValidation);
        return;
      }

      try {
        const updatedSujet = {
          ...selectedSujet,
          contenu: contenuContent,
          corrige: corrigeContent
        };
        await updateAncienSujet(selectedSujet.id, updatedSujet);
        const updatedSujets = anciensSujets.map(sujet =>
          sujet.id === updatedSujet.id ? updatedSujet : sujet
        );
        setAnciensSujets(updatedSujets);
        setTitleError('');
        setAnneeError('');
        toast.success('Ancien sujet mis à jour avec succès');
      } catch (error) {
        toast.error('Erreur lors de la sauvegarde de l\'ancien sujet');
      }
    }
  };

  const handleDeleteSujet = async (sujetId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ancien sujet ?')) {
      try {
        await deleteAncienSujet(sujetId);
        setAnciensSujets(anciensSujets.filter(sujet => sujet.id !== sujetId));
        if (selectedSujet && selectedSujet.id === sujetId) {
          setSelectedSujet(null);
        }
        toast.success('Ancien sujet supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'ancien sujet');
      }
    }
  };

  const indexOfLastSujet = currentPage * sujetsPerPage;
  const indexOfFirstSujet = indexOfLastSujet - sujetsPerPage;
  const currentSujets = anciensSujets.slice(indexOfFirstSujet, indexOfLastSujet);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="h-100 d-flex flex-column">
      <div className="container-fluid h-100 p-0">
        <div className="row h-100 g-0">
          {/* Sidebar des anciens sujets */}
          <div className="col-md-2 border-end p-3" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="d-grid gap-2">
              <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlus} /> Nouvel Ancien Sujet
              </button>

              {isLoading ? (
                <div className="text-center">Chargement...</div>
              ) : currentSujets.length > 0 ? (
                <div className="d-grid gap-2">
                  {currentSujets.map((sujet) => (
                    <div key={sujet.id} className="d-flex justify-content-between align-items-center">
                      <button
                        className={`btn btn-outline-success text-start ${selectedSujet && selectedSujet.id === sujet.id ? 'active' : ''}`}
                        style={{ width: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        onClick={() => handleSujetSelect(sujet)}
                      >
                        <FontAwesomeIcon icon={faBook} className="me-2" />
                        Sujet {sujet.annee}
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteSujet(sujet.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">Aucun ancien sujet disponible</div>
              )}

              {/* Pagination */}
              {anciensSujets.length > sujetsPerPage && (
                <div className="d-flex justify-content-center mt-3">
                  {Array.from({ length: Math.ceil(anciensSujets.length / sujetsPerPage) }, (_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${currentPage === i + 1 ? 'btn-secondary' : 'btn-outline-secondary'} me-1`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone d'édition */}
          <div className="col-md-10 h-100 d-flex flex-column">
            {selectedSujet ? (
              <>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <div className="d-flex align-items-center" style={{ width: '70%' }}>
                    <div className="me-2" style={{ maxWidth: '400px' }}>
                      <input
                        className={`form-control ${titleError ? 'is-invalid' : ''}`}
                        type="text"
                        placeholder="Titre du sujet"
                        value={selectedSujet.titre}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setSelectedSujet({ ...selectedSujet, titre: newTitle });
                          setTitleError(validateField('titre', newTitle));
                        }}
                      />
                      {titleError && <div className="invalid-feedback">{titleError}</div>}
                    </div>
                    <div className="me-2" style={{ width: '120px' }}>
                      <input
                        className={`form-control ${anneeError ? 'is-invalid' : ''}`}
                        type="number"
                        placeholder="Année"
                        value={selectedSujet.annee}
                        onChange={(e) => {
                          const newAnnee = parseInt(e.target.value);
                          setSelectedSujet({ ...selectedSujet, annee: newAnnee });
                          setAnneeError(validateField('annee', newAnnee));
                        }}
                      />
                      {anneeError && <div className="invalid-feedback">{anneeError}</div>}
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={handleSaveSujet}
                      disabled={!!titleError || !!anneeError}
                    >
                      <FontAwesomeIcon icon={faSave} /> Enregistrer
                    </button>
                  </div>
                  <div>
                    <span className="badge bg-primary">Page {selectedSujet.numero_page}</span>
                  </div>
                </div>

                <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                  <ul className="nav nav-tabs" id="sujetTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active" id="contenu-tab" data-bs-toggle="tab" data-bs-target="#contenu-tab-pane" type="button" role="tab" aria-controls="contenu-tab-pane" aria-selected="true">Contenu</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="corrige-tab" data-bs-toggle="tab" data-bs-target="#corrige-tab-pane" type="button" role="tab" aria-controls="corrige-tab-pane" aria-selected="false">Corrigé</button>
                    </li>
                  </ul>
                  <div className="tab-content mt-3" id="sujetTabContent" style={{ height: 'calc(100% - 50px)' }}>
                    <div className="tab-pane fade show active h-100" id="contenu-tab-pane" role="tabpanel" aria-labelledby="contenu-tab" tabIndex="0">
                      <ReactQuill
                        value={contenuContent}
                        onChange={handleContenuChange}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }, { 'align': [] }],
                            ['link', 'image', 'video'],
                            ['clean']
                          ]
                        }}
                        style={{ height: 'calc(100% - 20px)' }}
                      />
                    </div>
                    <div className="tab-pane fade h-100" id="corrige-tab-pane" role="tabpanel" aria-labelledby="corrige-tab" tabIndex="0">
                      <ReactQuill
                        value={corrigeContent}
                        onChange={handleCorrigeChange}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }, { 'align': [] }],
                            ['link', 'image', 'video'],
                            ['clean']
                          ]
                        }}
                        style={{ height: 'calc(100% - 20px)' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                  <h3>Sélectionnez un ancien sujet ou créez-en un nouveau</h3>
                  <p className="text-muted">Utilisez le panneau de gauche pour gérer vos anciens sujets</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour créer un nouvel ancien sujet */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Créer un nouvel ancien sujet</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="sujetTitle" className="form-label">Titre</label>
                <input
                  id="sujetTitle"
                  type="text"
                  className={`form-control ${newSujetErrors.titre ? 'is-invalid' : ''}`}
                  placeholder="Titre du nouvel ancien sujet"
                  value={newSujetTitle}
                  onChange={(e) => {
                    setNewSujetTitle(e.target.value);
                    setNewSujetErrors({
                      ...newSujetErrors,
                      titre: validateField('titre', e.target.value)
                    });
                  }}
                />
                {newSujetErrors.titre && <div className="invalid-feedback">{newSujetErrors.titre}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="sujetAnnee" className="form-label">Année</label>
                <input
                  id="sujetAnnee"
                  type="number"
                  className={`form-control ${newSujetErrors.annee ? 'is-invalid' : ''}`}
                  placeholder="Année du sujet"
                  value={newSujetAnnee}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setNewSujetAnnee(value);
                    setNewSujetErrors({
                      ...newSujetErrors,
                      annee: validateField('annee', value)
                    });
                  }}
                />
                {newSujetErrors.annee && <div className="invalid-feedback">{newSujetErrors.annee}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateSujet}
                disabled={!!newSujetErrors.titre || !!newSujetErrors.annee || !newSujetTitle}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AncienSujetTab;
