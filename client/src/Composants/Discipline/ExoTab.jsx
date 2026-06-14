import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { getExercicesByDiscipline, createExercice, updateExercice, deleteExercice } from '../../services/firestoreService';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const exerciceSchema = Yup.object().shape({
  titre: Yup.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Le titre ne doit contenir que des lettres, des chiffres, des espaces, des tirets et des underscores')
    .required('Le titre est requis'),
});

const ExoTab = ({ disciplineId }) => {
  const [exercices, setExercices] = useState([]);
  const [selectedExercice, setSelectedExercice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newExerciceTitle, setNewExerciceTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [newExerciceTitleError, setNewExerciceTitleError] = useState('');
  const [enonceContent, setEnonceContent] = useState('');
  const [corrigeContent, setCorrigeContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const exercicesPerPage = 10;

  const validateTitle = (title) => {
    try {
      exerciceSchema.validateSync({ titre: title });
      return '';
    } catch (error) {
      return error.message;
    }
  };

  const fetchExercices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getExercicesByDiscipline(disciplineId);
      setExercices(data.sort((a, b) => a.numero_page - b.numero_page));
    } catch (error) {
      toast.error('Erreur lors de la récupération des exercices');
    } finally {
      setIsLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    fetchExercices();
  }, [fetchExercices]);

  const handleCreateExercice = async () => {
    const error = validateTitle(newExerciceTitle);
    if (error) {
      setNewExerciceTitleError(error);
      return;
    }

    try {
      const newExercice = await createExercice({
        titre: newExerciceTitle,
        enonce: '',
        corrige: '',
        disciplineId: disciplineId,
        numeroPage: exercices.length + 1
      });
      setExercices([...exercices, newExercice].sort((a, b) => a.numero_page - b.numero_page));
      setShowModal(false);
      setNewExerciceTitle('');
      setNewExerciceTitleError('');
      toast.success('Nouvel exercice créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'exercice');
    }
  };

  const handleExerciceSelect = (exercice) => {
    setSelectedExercice(exercice);
    setEnonceContent(exercice.enonce || '');
    setCorrigeContent(exercice.corrige || '');
  };

  const handleEnonceChange = (content) => {
    setEnonceContent(content);
  };

  const handleCorrigeChange = (content) => {
    setCorrigeContent(content);
  };

  const handleSaveExercice = async () => {
    if (selectedExercice) {
      const error = validateTitle(selectedExercice.titre);
      if (error) {
        setTitleError(error);
        return;
      }

      try {
        const updatedExercice = {
          ...selectedExercice,
          enonce: enonceContent,
          corrige: corrigeContent
        };
        await updateExercice(selectedExercice.id, updatedExercice);
        const updatedExercices = exercices.map(exercice =>
          exercice.id === updatedExercice.id ? updatedExercice : exercice
        );
        setExercices(updatedExercices);
        setTitleError('');
        toast.success('Exercice mis à jour avec succès');
      } catch (error) {
        toast.error('Erreur lors de la sauvegarde de l\'exercice');
      }
    }
  };

  const handleDeleteExercice = async (exerciceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      try {
        await deleteExercice(exerciceId);
        setExercices(exercices.filter(exercice => exercice.id !== exerciceId));
        if (selectedExercice && selectedExercice.id === exerciceId) {
          setSelectedExercice(null);
        }
        toast.success('Exercice supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'exercice');
      }
    }
  };

  const indexOfLastExercice = currentPage * exercicesPerPage;
  const indexOfFirstExercice = indexOfLastExercice - exercicesPerPage;
  const currentExercices = exercices.slice(indexOfFirstExercice, indexOfLastExercice);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="h-100 d-flex flex-column">
      <div className="container-fluid h-100 p-0">
        <div className="row h-100 g-0">
          {/* Sidebar des exercices */}
          <div className="col-md-2 border-end p-3" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="d-grid gap-2">
              <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlus} /> Nouvel Exercice
              </button>

              {isLoading ? (
                <div className="text-center">Chargement...</div>
              ) : currentExercices.length > 0 ? (
                <div className="d-grid gap-2">
                  {currentExercices.map((exercice) => (
                    <div key={exercice.id} className="d-flex justify-content-between align-items-center">
                      <button
                        className={`btn btn-outline-success text-start ${selectedExercice && selectedExercice.id === exercice.id ? 'active' : ''}`}
                        style={{ width: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        onClick={() => handleExerciceSelect(exercice)}
                      >
                        <FontAwesomeIcon icon={faBook} className="me-2" />
                        Exercice {exercice.numero_page}
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteExercice(exercice.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">Aucun exercice disponible</div>
              )}

              {/* Pagination */}
              {exercices.length > exercicesPerPage && (
                <div className="d-flex justify-content-center mt-3">
                  {Array.from({ length: Math.ceil(exercices.length / exercicesPerPage) }, (_, i) => (
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
            {selectedExercice ? (
              <>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <div className="d-flex align-items-center" style={{ width: '70%' }}>
                    <input
                      className={`form-control ${titleError ? 'is-invalid' : ''}`}
                      type="text"
                      placeholder="Titre de l'exercice"
                      value={selectedExercice.titre}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setSelectedExercice({ ...selectedExercice, titre: newTitle });
                        setTitleError(validateTitle(newTitle));
                      }}
                      style={{ maxWidth: '400px' }}
                    />
                    {titleError && <div className="invalid-feedback">{titleError}</div>}
                    <button
                      className="btn btn-success ms-2"
                      onClick={handleSaveExercice}
                      disabled={!!titleError}
                    >
                      <FontAwesomeIcon icon={faSave} /> Enregistrer
                    </button>
                  </div>
                  <div>
                    <span className="badge bg-primary">Page {selectedExercice.numero_page}</span>
                  </div>
                </div>

                <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                  <ul className="nav nav-tabs" id="exerciceTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active" id="enonce-tab" data-bs-toggle="tab" data-bs-target="#enonce-tab-pane" type="button" role="tab" aria-controls="enonce-tab-pane" aria-selected="true">Énoncé</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="corrige-tab" data-bs-toggle="tab" data-bs-target="#corrige-tab-pane" type="button" role="tab" aria-controls="corrige-tab-pane" aria-selected="false">Corrigé</button>
                    </li>
                  </ul>
                  <div className="tab-content mt-3" id="exerciceTabContent" style={{ height: 'calc(100% - 50px)' }}>
                    <div className="tab-pane fade show active h-100" id="enonce-tab-pane" role="tabpanel" aria-labelledby="enonce-tab" tabIndex="0">
                      <ReactQuill
                        value={enonceContent}
                        onChange={handleEnonceChange}
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
                  <h3>Sélectionnez un exercice ou créez-en un nouveau</h3>
                  <p className="text-muted">Utilisez le panneau de gauche pour gérer vos exercices</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour créer un nouvel exercice */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Créer un nouvel exercice</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className={`form-control ${newExerciceTitleError ? 'is-invalid' : ''}`}
                placeholder="Titre du nouvel exercice"
                value={newExerciceTitle}
                onChange={(e) => {
                  setNewExerciceTitle(e.target.value);
                  setNewExerciceTitleError(validateTitle(e.target.value));
                }}
              />
              {newExerciceTitleError && <div className="invalid-feedback">{newExerciceTitleError}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateExercice}
                disabled={!!newExerciceTitleError || !newExerciceTitle}
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

export default ExoTab;
