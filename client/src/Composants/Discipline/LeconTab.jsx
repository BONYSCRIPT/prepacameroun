import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import { getLeconsByDiscipline, createLecon, updateLecon, deleteLecon } from '../../services/firestoreService';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const lessonSchema = Yup.object().shape({
  titre: Yup.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Le titre ne doit contenir que des lettres, des chiffres, des espaces, des tirets et des underscores')
    .required('Le titre est requis'),
});

const LeconTab = ({ disciplineId }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonTitleError, setNewLessonTitleError] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [titleError, setTitleError] = useState('');
  const lessonsPerPage = 10;

  const validateTitle = (title) => {
    try {
      lessonSchema.validateSync({ titre: title });
      setTitleError('');
      return true;
    } catch (error) {
      setTitleError(error.message);
      return false;
    }
  };

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLeconsByDiscipline(disciplineId);
      setLessons(data.sort((a, b) => a.numero_page - b.numero_page));
    } catch (error) {
      toast.error('Erreur lors de la récupération des leçons');
    } finally {
      setIsLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleCreateLesson = async () => {
    try {
      await lessonSchema.validate({ titre: newLessonTitle });

      const newLecon = await createLecon({
        titre: newLessonTitle,
        contenu: '',
        disciplineId: disciplineId,
        numeroPage: lessons.length + 1
      });
      setLessons([...lessons, newLecon].sort((a, b) => a.numero_page - b.numero_page));
      setShowModal(false);
      setNewLessonTitle('');
      toast.success('Nouvelle leçon créée avec succès');
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de la création de la leçon');
      }
    }
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setEditorContent(lesson.contenu);
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const handleSaveLesson = async () => {
    if (selectedLesson) {
      try {
        await lessonSchema.validate({ titre: selectedLesson.titre });

        await updateLecon(selectedLesson.id, {
          titre: selectedLesson.titre,
          contenu: editorContent,
          numeroPage: selectedLesson.numero_page
        });
        const updatedLesson = { ...selectedLesson, contenu: editorContent };
        const updatedLessons = lessons.map(lesson =>
          lesson.id === updatedLesson.id ? updatedLesson : lesson
        );
        setLessons(updatedLessons);
        toast.success('Leçon mise à jour avec succès');
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          toast.error(error.message);
        } else {
          console.error('Erreur sauvegarde:', error);
          toast.error('Erreur lors de la sauvegarde de la leçon');
        }
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette leçon ?')) {
      try {
        await deleteLecon(lessonId);
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
        if (selectedLesson && selectedLesson.id === lessonId) {
          setSelectedLesson(null);
        }
        toast.success('Leçon supprimée avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de la leçon');
      }
    }
  };

  const indexOfLastLesson = currentPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="h-100 d-flex flex-column">
      <div className="container-fluid h-100 p-0">
        <div className="row h-100 g-0">
          {/* Sidebar des leçons */}
          <div className="col-md-2 border-end p-3" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="d-grid gap-2">
              <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faPlus} /> Nouvelle Leçon
              </button>

              {isLoading ? (
                <div className="text-center">Chargement...</div>
              ) : currentLessons.length > 0 ? (
                <div className="d-grid gap-2">
                  {currentLessons.map((lesson) => (
                    <div key={lesson.id} className="d-flex justify-content-between align-items-center">
                      <button
                        className={`btn btn-outline-success text-start ${selectedLesson && selectedLesson.id === lesson.id ? 'active' : ''}`}
                        style={{ width: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        <FontAwesomeIcon icon={faBook} className="me-2" />
                        Leçon {lesson.numero_page}
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">Aucune leçon disponible</div>
              )}

              {/* Pagination */}
              {lessons.length > lessonsPerPage && (
                <div className="d-flex justify-content-center mt-3">
                  {Array.from({ length: Math.ceil(lessons.length / lessonsPerPage) }, (_, i) => (
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
            {selectedLesson ? (
              <>
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <div className="d-flex align-items-center" style={{ width: '70%' }}>
                    <input
                      className={`form-control ${titleError ? 'is-invalid' : ''}`}
                      type="text"
                      placeholder="Titre de leçon"
                      value={selectedLesson.titre}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setSelectedLesson({ ...selectedLesson, titre: newTitle });
                        validateTitle(newTitle);
                      }}
                      style={{ maxWidth: '400px' }}
                    />
                    {titleError && <div className="invalid-feedback">{titleError}</div>}
                    <button
                      className="btn btn-success ms-2"
                      onClick={handleSaveLesson}
                      disabled={!!titleError}
                    >
                      <FontAwesomeIcon icon={faSave} /> Enregistrer
                    </button>
                  </div>
                  <div>
                    <span className="badge bg-primary">Page {selectedLesson.numero_page}</span>
                  </div>
                </div>

                <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                  <ReactQuill
                    value={editorContent}
                    onChange={handleEditorChange}
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
              </>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                  <h3>Sélectionnez une leçon ou créez-en une nouvelle</h3>
                  <p className="text-muted">Utilisez le panneau de gauche pour gérer vos leçons</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour créer une nouvelle leçon */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Créer une nouvelle leçon</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className={`form-control ${newLessonTitleError ? 'is-invalid' : ''}`}
                placeholder="Titre de la nouvelle leçon"
                value={newLessonTitle}
                onChange={(e) => {
                  setNewLessonTitle(e.target.value);
                  const isValid = validateTitle(e.target.value);
                  setNewLessonTitleError(isValid ? '' : titleError);
                }}
              />
              {newLessonTitleError && <div className="invalid-feedback">{newLessonTitleError}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateLesson}
                disabled={!!newLessonTitleError || !newLessonTitle}
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

export default LeconTab;
