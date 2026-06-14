import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from "../Composants/Admin/AdminNavbar";
import { getAllPrepas, getAllDisciplines, createPrepa, updatePrepa, deletePrepa, togglePublishPrepa, createDiscipline, updateDiscipline, deleteDiscipline } from '../services/firestoreService';
import { useAdminAuth } from '../contexts/useAdminAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { faEdit, faTrash, faPlus, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AdminDisciplineCard from "../Composants/Admin/AdminDisciplineCard";

// Définition des couleurs de la charte graphique
const theme = {
  primary: '#bf0051',       // Rouge principal (logo)
  primaryDark: '#8c003c',   // Rouge foncé pour hover
  secondary: '#0274d9',     // Bleu (logo)
  secondaryDark: '#015aa9', // Bleu foncé pour hover
  dark: '#212529',          // Gris foncé pour texte
  light: '#f8f9fa',         // Gris très clair pour fonds
  lightAccent: '#f1f1f1',   // Gris clair pour accents
  cardShadow: '0 10px 20px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.1)',
  buttonShadow: '0 4px 14px rgba(191, 0, 81, 0.4)',
  buttonSecondaryShadow: '0 4px 14px rgba(2, 116, 217, 0.4)',
  transition: 'all 0.3s ease',
  borderRadius: '0.75rem',
  buttonBorderRadius: '30px'
};

const Admin = () => {
  const [prepas, setPrepas] = useState([]);
  const [prepaErrors, setPrepaErrors] = useState({});
  const [selectedPrepa, setSelectedPrepa] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [disciplineErrors, setDisciplineErrors] = useState({});
  const [newPrepaName, setNewPrepaName] = useState('');
  const [newPrepaDescription, setNewPrepaDescription] = useState('');
  const [newPrepaPrice, setNewPrepaPrice] = useState('');
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [newDisciplineDescription, setNewDisciplineDescription] = useState('');
  const [showUpdateDisciplineModal, setShowUpdateDisciplineModal] = useState(false);
  const [updateDisciplineId, setUpdateDisciplineId] = useState(null);
  const [updateDisciplineName, setUpdateDisciplineName] = useState('');
  const [updateDisciplineDescription, setUpdateDisciplineDescription] = useState('');
  const [showPrepaModal, setShowPrepaModal] = useState(false);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [showUpdatePrepaModal, setShowUpdatePrepaModal] = useState(false);
  const [updatePrepaId, setUpdatePrepaId] = useState(null);
  const [updatePrepaName, setUpdatePrepaName] = useState('');
  const [updatePrepaDescription, setUpdatePrepaDescription] = useState('');
  const [updatePrepaPrice, setUpdatePrepaPrice] = useState('');
  const [updatePrepaErrors, setUpdatePrepaErrors] = useState({});
  const [showDeletePrepaModal, setShowDeletePrepaModal] = useState(false);
  const [showDeleteDisciplineModal, setShowDeleteDisciplineModal] = useState(false);
  const [prepaToDelete, setPrepaToDelete] = useState(null);
  const [disciplineToDelete, setDisciplineToDelete] = useState(null);
  const [newPrepaImage, setNewPrepaImage] = useState(null);
  const [updatePrepaImage, setUpdatePrepaImage] = useState(null);
  const [newDisciplineImage, setNewDisciplineImage] = useState(null);
  const [updateDisciplineImage, setUpdateDisciplineImage] = useState(null);
  const [prepaImageError, setPrepaImageError] = useState('');
  const [disciplineImageError, setDisciplineImageError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchPrepas();
    fetchDisciplines();
  }, []);

  useEffect(() => {
    if (prepas.length > 0 && !selectedPrepa) {
      setSelectedPrepa(prepas[0]);
    }
  }, [prepas, selectedPrepa]);

  const prepaSchema = Yup.object().shape({
    nom: Yup.string()
      .required('Le nom est requis')
      .min(3, 'Le nom doit contenir au moins 3 caractères'),
    description: Yup.string()
      .required('La description est requise'),
    prix: Yup.number()
      .positive('Le prix doit être positif')
      .required('Le prix est requis'),
    auteur: Yup.string()
      .required('L\'identifiant de l\'administrateur est requis')
  });

  const updatePrepaSchema = Yup.object().shape({
    nom: Yup.string()
      .min(3, 'Le nom doit contenir au moins 3 caractères'),
    description: Yup.string(),
    prix: Yup.number()
      .positive('Le prix doit être positif')
  });

  const disciplineSchema = Yup.object().shape({
    nom: Yup.string()
      .required('Le nom de la discipline est requis')
      .min(3, 'Le nom doit contenir au moins 3 caractères')
      .max(100, 'Le nom ne doit pas dépasser 100 caractères'),
    description: Yup.string()
      .required('La description de la discipline est requise')
      .max(500, 'La description ne doit pas dépasser 500 caractères')
  });

  const fetchPrepas = async () => {
    try {
      const data = await getAllPrepas();
      setPrepas(data.map(prepa => ({
        ...prepa,
        imageUrl: prepa.image_url ? `${prepa.image_url}` : null
      })));
    } catch (error) {
      console.error('Erreur lors de la récupération des prepas:', error);
      toast.error('Erreur lors de la récupération des prepas');
    }
  };

  const fetchDisciplines = async () => {
    try {
      const data = await getAllDisciplines();
      setDisciplines(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des disciplines:', error);
    }
  };

  const togglePublishStatus = async (prepaId) => {
    try {
      const currentPrepa = prepas.find(p => p.id === prepaId);
      const newStatus = await togglePublishPrepa(prepaId, currentPrepa?.is_published || false);

      setPrepas(prevPrepas => prevPrepas.map(prepa =>
        prepa.id === prepaId ? { ...prepa, is_published: newStatus } : prepa
      ));

      toast.success(`Préparation ${newStatus ? 'publiée' : 'dépubliée'} avec succès`);
    } catch (error) {
      console.error('Erreur lors du changement de statut de publication:', error);
      toast.error('Erreur lors du changement de statut de publication');
    }
  };

  const handleCreatePrepa = async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem('adminData'));
      const adminId = adminData?.id || adminData?.firebase_uid;

      if (!newPrepaImage) {
        setPrepaImageError('L\'image est obligatoire');
        return;
      }

      await prepaSchema.validate({
        nom: newPrepaName,
        description: newPrepaDescription,
        prix: newPrepaPrice,
        auteur: adminId
      }, { abortEarly: false });

      const newPrepa = await createPrepa({
        nom: newPrepaName,
        description: newPrepaDescription,
        prix: newPrepaPrice,
        adminId: adminId,
        imageFile: newPrepaImage,
      });

      setPrepas([...prepas, newPrepa]);
      setNewPrepaName('');
      setNewPrepaDescription('');
      setNewPrepaPrice('');
      setNewPrepaImage(null);
      setSelectedPrepa(newPrepa);
      setShowPrepaModal(false);
      setPrepaImageError('');
      toast.success('Préparation créée avec succès');

    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setPrepaErrors(errors);
      } else {
        console.error('Erreur lors de la création de la prepa:', error);
      }
    }
  };

  const handleUpdatePrepa = async (prepaId) => {
    setUpdatePrepaId(prepaId);
    const prepaToUpdate = prepas.find(p => p.id === prepaId);
    if (prepaToUpdate) {
      setUpdatePrepaName(prepaToUpdate.nom);
      setUpdatePrepaDescription(prepaToUpdate.description);
      setUpdatePrepaPrice(prepaToUpdate.prix);
      setShowUpdatePrepaModal(true);
    }
  };

  const submitUpdatePrepa = async () => {
    try {
      await updatePrepaSchema.validate({ nom: updatePrepaName, description: updatePrepaDescription, prix: updatePrepaPrice }, { abortEarly: false });
      setUpdatePrepaErrors({});

      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('nom', updatePrepaName);
      formData.append('description', updatePrepaDescription);
      formData.append('prix', updatePrepaPrice);
      if (updatePrepaImage) {
        formData.append('image', updatePrepaImage);
      }

      const updatedPrepa = await updatePrepa(updatePrepaId, {
        nom: updatePrepaName,
        description: updatePrepaDescription,
        prix: updatePrepaPrice,
        imageFile: updatePrepaImage || null,
        currentImageUrl: prepas.find(p => p.id === updatePrepaId)?.image_url,
      });

      setPrepas(prevPrepas => {
        const updatedPrepas = prevPrepas.map(p => p.id === updatePrepaId ? { ...p, ...updatedPrepa } : p);
        if (selectedPrepa && selectedPrepa.id === updatePrepaId) {
          setSelectedPrepa({ ...selectedPrepa, ...updatedPrepa });
        }
        return updatedPrepas;
      });
      setShowUpdatePrepaModal(false);
      setUpdatePrepaImage(null);
      setPrepaImageError('');
      fetchPrepas();
    } catch (error) {
      if (error.response && error.response.data.imageError) {
        setPrepaImageError(error.response.data.imageError);
      } else if (error instanceof Yup.ValidationError) {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setUpdatePrepaErrors(errors);
      } else {
        console.error('Erreur lors de la mise à jour de la prepa:', error);
      }
    }
  };

  const handleDeletePrepa = async (prepaId) => {
    try {
      await deletePrepa(prepaId);
      const updatedPrepas = prepas.filter(p => p.id !== prepaId);
      setPrepas(updatedPrepas);
      if (selectedPrepa && selectedPrepa.id === prepaId) {
        setSelectedPrepa(updatedPrepas.length > 0 ? updatedPrepas[0] : null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la prepa:', error);
    }
  };

  const handleSelectPrepa = (prepa) => {
    setSelectedPrepa(prepa);
  };

  const handleCreateDiscipline = async () => {
    try {
      await disciplineSchema.validate({ nom: newDisciplineName, description: newDisciplineDescription }, { abortEarly: false });
      setDisciplineErrors({});

      if (selectedPrepa) {
        const formData = new FormData();
        formData.append('nom', newDisciplineName);
        formData.append('description', newDisciplineDescription);
        formData.append('prepa_concours_id', selectedPrepa.id);
        if (newDisciplineImage) {
          formData.append('image', newDisciplineImage);
        }

        const newDiscipline = await createDiscipline({
          nom: newDisciplineName,
          description: newDisciplineDescription,
          prepaConcoursId: selectedPrepa?.id,
          imageFile: newDisciplineImage || null,
        });

        setDisciplines([...disciplines, newDiscipline]);
        setNewDisciplineName('');
        setNewDisciplineDescription('');
        setNewDisciplineImage(null);
        setShowDisciplineModal(false);
        setDisciplineImageError('');
      }
    } catch (error) {
      if (error.response && error.response.data.imageError) {
        setDisciplineImageError(error.response.data.imageError);
      } else if (error instanceof Yup.ValidationError) {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setDisciplineErrors(errors);
      } else {
        console.error('Erreur lors de la création de la discipline:', error);
      }
    }
  };

  const handleUpdateDiscipline = async () => {
    try {
      await disciplineSchema.validate({ nom: updateDisciplineName, description: updateDisciplineDescription }, { abortEarly: false });
      setDisciplineErrors({});

      const formData = new FormData();
      formData.append('nom', updateDisciplineName);
      formData.append('description', updateDisciplineDescription);
      if (updateDisciplineImage) {
        formData.append('image', updateDisciplineImage);
      }

      const updatedDiscipline = await updateDiscipline(updateDisciplineId, {
        nom: updateDisciplineName,
        description: updateDisciplineDescription,
        imageFile: updateDisciplineImage || null,
        currentImageUrl: disciplines.find(d => d.id === updateDisciplineId)?.image_url,
      });

      setDisciplines(prevDisciplines =>
        prevDisciplines.map(discipline =>
          discipline.id === updateDisciplineId ? { ...discipline, ...updatedDiscipline } : discipline
        )
      );
      setShowUpdateDisciplineModal(false);
      setUpdateDisciplineImage(null);
      setDisciplineImageError('');
      fetchDisciplines();
    } catch (error) {
      if (error.response && error.response.data.imageError) {
        setDisciplineImageError(error.response.data.imageError);
      } else if (error instanceof Yup.ValidationError) {
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setDisciplineErrors(errors);
      } else {
        console.error('Erreur lors de la mise à jour de la discipline:', error);
      }
    }
  };

  const handleDeleteDiscipline = async (disciplineId) => {
    try {
      await deleteDiscipline(disciplineId);
      setDisciplines(disciplines.filter(d => d.id !== disciplineId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la discipline:', error);
    }
  };

  const openUpdateDisciplineModal = (discipline) => {
    setUpdateDisciplineId(discipline.id);
    setUpdateDisciplineName(discipline.nom);
    setUpdateDisciplineDescription(discipline.description);
    setDisciplineErrors({});
    setShowUpdateDisciplineModal(true);
  };

  const handleDisciplineClick = (disciplineId) => {
    navigate(`/admin/discipline/${disciplineId}`);
  };

  const confirmDeletePrepa = (prepaId) => {
    setPrepaToDelete(prepaId);
    setShowDeletePrepaModal(true);
  };

  const confirmDeleteDiscipline = (disciplineId) => {
    setDisciplineToDelete(disciplineId);
    setShowDeleteDisciplineModal(true);
  };

  const executeDeletePrepa = async () => {
    if (prepaToDelete) {
      await handleDeletePrepa(prepaToDelete);
      setShowDeletePrepaModal(false);
      setPrepaToDelete(null);
    }
  };

  const executeDeleteDiscipline = async () => {
    if (disciplineToDelete) {
      await handleDeleteDiscipline(disciplineToDelete);
      setShowDeleteDisciplineModal(false);
      setDisciplineToDelete(null);
    }
  };

  const isUpdatePrepaFormValid = () => {
    return updatePrepaName.trim() !== '' && updatePrepaDescription.trim() !== '' && updatePrepaPrice !== '';
  };

  return (
    <div className="fixed-top" style={{ height: '100vh', backgroundColor: theme.light }}>
      <AdminNavbar />
      <div className="container-fluid" style={{ height: '85vh' }}>
        <div className="row">
          {/* Sidebar avec les prepas */}
          <div className="col-sm-3 border-end mt-2" style={{ backgroundColor: 'white', boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }}>
            <div className="d-grid justify-content-center w-100 pt-4">
              <button
                className="btn mb-3"
                onClick={() => setShowPrepaModal(true)}
                style={{
                  backgroundColor: theme.primary,
                  color: 'white',
                  borderRadius: theme.buttonBorderRadius,
                  padding: '10px 15px',
                  fontWeight: '600',
                  boxShadow: theme.buttonShadow,
                  transition: theme.transition
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primaryDark;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Nouvelle préparation
              </button>
              <h5 className='text-center pb-2 fw-bold' style={{ color: theme.dark }}>Préparations existantes</h5>
              <div className="d-grid justify-content-center" style={{ width: '20vw', maxHeight: '70vh', overflowY: 'auto' }}>
                {prepas.map(prepa => (
                  <div
                    key={prepa.id}
                    className="d-block align-items-center bg-white mt-3 p-3 mb-2 rounded"
                    style={{
                      boxShadow: theme.cardShadow,
                      borderRadius: theme.borderRadius,
                      transition: theme.transition
                    }}
                  >
                    <div
                      className="btn w-100 mb-2"
                      style={{
                        backgroundColor: selectedPrepa && selectedPrepa.id === prepa.id ? theme.secondary : theme.dark,
                        color: 'white',
                        height: '10vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: theme.borderRadius,
                        fontWeight: '600',
                        transition: theme.transition
                      }}
                      onClick={() => handleSelectPrepa(prepa)}
                      onMouseOver={(e) => {
                        if (!(selectedPrepa && selectedPrepa.id === prepa.id)) {
                          e.currentTarget.style.backgroundColor = '#343a40';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!(selectedPrepa && selectedPrepa.id === prepa.id)) {
                          e.currentTarget.style.backgroundColor = theme.dark;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {prepa.nom}
                    </div>
                    <div className='mt-2 d-flex justify-content-center gap-2'>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleUpdatePrepa(prepa.id)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: 'white',
                          borderRadius: '20px',
                          transition: theme.transition
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#e0a800';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffc107';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => confirmDeletePrepa(prepa.id)}
                        style={{
                          backgroundColor: theme.primary,
                          color: 'white',
                          borderRadius: '20px',
                          transition: theme.transition
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = theme.primaryDark;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = theme.primary;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => togglePublishStatus(prepa.id)}
                        style={{
                          backgroundColor: prepa.is_published ? '#28a745' : '#6c757d',
                          color: 'white',
                          borderRadius: '20px',
                          transition: theme.transition
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = prepa.is_published ? '#218838' : '#5a6268';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = prepa.is_published ? '#28a745' : '#6c757d';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FontAwesomeIcon icon={prepa.is_published ? faEye : faEyeSlash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal avec les disciplines */}
          <div className="col-sm-9 d-flex align-items-center justify-content-center" style={{ height: '84vh' }}>
            <div className="w-100">
              {selectedPrepa ? (
                <>
                  <div className="mt-4">
                    <div
                      className="d-flex justify-content-between align-items-center p-3 ps-4 pe-3 bg-white border rounded mx-auto"
                      style={{
                        width: '70vw',
                        boxShadow: theme.cardShadow,
                        borderRadius: theme.borderRadius
                      }}
                    >
                      <h5 className='mb-0 fw-bold' style={{ color: theme.dark }}>
                        {selectedPrepa.nom}
                      </h5>
                      <button
                        className="btn"
                        onClick={() => setShowDisciplineModal(true)}
                        style={{
                          backgroundColor: theme.secondary,
                          color: 'white',
                          borderRadius: theme.buttonBorderRadius,
                          padding: '8px 16px',
                          fontWeight: '600',
                          boxShadow: theme.buttonSecondaryShadow,
                          transition: theme.transition
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = theme.secondaryDark;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = theme.secondary;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Nouvelle discipline
                      </button>
                    </div>
                  </div>
                  <div className="mt-4" style={{ height: '70vh', overflowY: 'auto' }}>
                    <div className="container">
                      <div className="row ms-4" style={{ height: '100%' }}>
                        {disciplines.filter(d => d.prepa_concours_id === selectedPrepa.id).length > 0 ? (
                          disciplines.filter(d => d.prepa_concours_id === selectedPrepa.id).map(discipline => (
                            <div key={discipline.id} className="col-md-3 col-lg-4 mb-3">
                              <AdminDisciplineCard
                                discipline={discipline}
                                onClick={handleDisciplineClick}
                                onUpdate={openUpdateDisciplineModal}
                                onDelete={confirmDeleteDiscipline}
                                theme={theme}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-12 text-center mt-5">
                            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                              Aucune discipline n&apos;a été créée pour cette préparation.
                            </p>
                            <button
                              className="btn mt-3"
                              onClick={() => setShowDisciplineModal(true)}
                              style={{
                                backgroundColor: theme.secondary,
                                color: 'white',
                                borderRadius: theme.buttonBorderRadius,
                                padding: '10px 20px',
                                fontWeight: '600',
                                boxShadow: theme.buttonSecondaryShadow,
                                transition: theme.transition
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = theme.secondaryDark;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = theme.secondary;
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} className="me-2" /> Créer une discipline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center mt-5 p-5" style={{ backgroundColor: 'white', borderRadius: theme.borderRadius, boxShadow: theme.cardShadow }}>
                  <h5 style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    Aucune préparation sélectionnée
                  </h5>
                  <p className="mt-3 mb-4">Veuillez sélectionner une préparation existante ou en créer une nouvelle.</p>
                  <button
                    className="btn"
                    onClick={() => setShowPrepaModal(true)}
                    style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      borderRadius: theme.buttonBorderRadius,
                      padding: '10px 20px',
                      fontWeight: '600',
                      boxShadow: theme.buttonShadow,
                      transition: theme.transition
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primaryDark;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = theme.primary;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Créer une préparation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour créer une nouvelle préparation */}
      <Modal
        show={showPrepaModal}
        onHide={() => setShowPrepaModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: theme.light }}>
          <Modal.Title style={{ color: theme.dark, fontWeight: '600' }}>
            Créer une nouvelle préparation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.light }}>
          <div className="mb-3">
            <label htmlFor="newPrepaName" className="form-label fw-medium">Nom de la préparation</label>
            <input
              type="text"
              id="newPrepaName"
              className={`form-control ${prepaErrors.nom ? 'is-invalid' : ''}`}
              placeholder="Entrez le nom de la préparation"
              value={newPrepaName}
              onChange={(e) => setNewPrepaName(e.target.value)}
            />
            {prepaErrors.nom && <div className="invalid-feedback">{prepaErrors.nom}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="newPrepaDescription" className="form-label fw-medium">Description</label>
            <textarea
              id="newPrepaDescription"
              className={`form-control ${prepaErrors.description ? 'is-invalid' : ''}`}
              placeholder="Entrez une description détaillée"
              value={newPrepaDescription}
              onChange={(e) => setNewPrepaDescription(e.target.value)}
              rows="3"
            />
            {prepaErrors.description && <div className="invalid-feedback">{prepaErrors.description}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="newPrepaPrice" className="form-label fw-medium">Prix (XAF)</label>
            <input
              type="number"
              id="newPrepaPrice"
              className={`form-control ${prepaErrors.prix ? 'is-invalid' : ''}`}
              placeholder="Entrez le prix"
              value={newPrepaPrice}
              onChange={(e) => setNewPrepaPrice(e.target.value)}
            />
            {prepaErrors.prix && <div className="invalid-feedback">{prepaErrors.prix}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="newPrepaImage" className="form-label fw-medium">Image de couverture</label>
            <input
              type="file"
              id="newPrepaImage"
              className="form-control"
              onChange={(e) => setNewPrepaImage(e.target.files[0])}
            />
            <small className="form-text text-muted">Format recommandé: JPG ou PNG, max 2MB</small>
            {prepaImageError && <div className="text-danger mt-1">{prepaImageError}</div>}
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.light, borderTop: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowPrepaModal(false)}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreatePrepa}
            disabled={!newPrepaName.trim() || !newPrepaDescription.trim() || !newPrepaPrice || !newPrepaImage}
            style={{
              backgroundColor: theme.primary,
              borderColor: theme.primary,
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.primaryDark;
              e.currentTarget.style.borderColor = theme.primaryDark;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary;
              e.currentTarget.style.borderColor = theme.primary;
            }}
          >
            Créer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour créer une nouvelle discipline */}
      <Modal
        show={showDisciplineModal}
        onHide={() => setShowDisciplineModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: theme.light }}>
          <Modal.Title style={{ color: theme.dark, fontWeight: '600' }}>
            Créer une nouvelle discipline
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.light }}>
          <div className="mb-3">
            <label htmlFor="newDisciplineName" className="form-label fw-medium">Nom de la discipline</label>
            <input
              type="text"
              id="newDisciplineName"
              className={`form-control ${disciplineErrors.nom ? 'is-invalid' : ''}`}
              value={newDisciplineName}
              onChange={(e) => setNewDisciplineName(e.target.value)}
              placeholder="Entrez le nom de la discipline"
            />
            {disciplineErrors.nom && <div className="invalid-feedback">{disciplineErrors.nom}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="newDisciplineDescription" className="form-label fw-medium">Description</label>
            <textarea
              id="newDisciplineDescription"
              className={`form-control ${disciplineErrors.description ? 'is-invalid' : ''}`}
              value={newDisciplineDescription}
              onChange={(e) => setNewDisciplineDescription(e.target.value)}
              placeholder="Entrez une description détaillée"
              rows="3"
            />
            {disciplineErrors.description && <div className="invalid-feedback">{disciplineErrors.description}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="newDisciplineImage" className="form-label fw-medium">Image de la discipline</label>
            <input
              type="file"
              id="newDisciplineImage"
              className="form-control"
              onChange={(e) => setNewDisciplineImage(e.target.files[0])}
            />
            <small className="form-text text-muted">Format recommandé: JPG ou PNG, max 2MB</small>
            {disciplineImageError && <div className="text-danger mt-1">{disciplineImageError}</div>}
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.light, borderTop: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDisciplineModal(false)}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateDiscipline}
            disabled={!newDisciplineName.trim() || !newDisciplineDescription.trim()}
            style={{
              backgroundColor: theme.secondary,
              borderColor: theme.secondary,
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondaryDark;
              e.currentTarget.style.borderColor = theme.secondaryDark;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondary;
              e.currentTarget.style.borderColor = theme.secondary;
            }}
          >
            Créer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour modifier une discipline */}
      <Modal
        show={showUpdateDisciplineModal}
        onHide={() => setShowUpdateDisciplineModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: theme.light }}>
          <Modal.Title style={{ color: theme.dark, fontWeight: '600' }}>
            Modifier la discipline
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.light }}>
          <div className="mb-3">
            <label htmlFor="updateDisciplineName" className="form-label fw-medium">Nom de la discipline</label>
            <input
              type="text"
              id="updateDisciplineName"
              className={`form-control ${disciplineErrors.nom ? 'is-invalid' : ''}`}
              value={updateDisciplineName}
              onChange={(e) => setUpdateDisciplineName(e.target.value)}
            />
            {disciplineErrors.nom && <div className="invalid-feedback">{disciplineErrors.nom}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="updateDisciplineDescription" className="form-label fw-medium">Description</label>
            <textarea
              id="updateDisciplineDescription"
              className={`form-control ${disciplineErrors.description ? 'is-invalid' : ''}`}
              value={updateDisciplineDescription}
              onChange={(e) => setUpdateDisciplineDescription(e.target.value)}
              rows="3"
            />
            {disciplineErrors.description && <div className="invalid-feedback">{disciplineErrors.description}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="updateDisciplineImage" className="form-label fw-medium">Nouvelle image de la discipline</label>
            <input
              type="file"
              id="updateDisciplineImage"
              className="form-control"
              onChange={(e) => setUpdateDisciplineImage(e.target.files[0])}
            />
            <small className="form-text text-muted">Format recommandé: JPG ou PNG, max 2MB</small>
            {disciplineImageError && <div className="text-danger mt-1">{disciplineImageError}</div>}
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.light, borderTop: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowUpdateDisciplineModal(false)}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdateDiscipline}
            disabled={!updateDisciplineName.trim() || !updateDisciplineDescription.trim()}
            style={{
              backgroundColor: theme.secondary,
              borderColor: theme.secondary,
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondaryDark;
              e.currentTarget.style.borderColor = theme.secondaryDark;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondary;
              e.currentTarget.style.borderColor = theme.secondary;
            }}
          >
            Mettre à jour
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour modifier une préparation */}
      <Modal
        show={showUpdatePrepaModal}
        onHide={() => setShowUpdatePrepaModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: theme.light }}>
          <Modal.Title style={{ color: theme.dark, fontWeight: '600' }}>
            Modifier la préparation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.light }}>
          <div className="mb-3">
            <label htmlFor="updatePrepaName" className="form-label fw-medium">Nom de la préparation</label>
            <input
              type="text"
              id="updatePrepaName"
              className={`form-control ${updatePrepaErrors.nom ? 'is-invalid' : ''}`}
              placeholder="Nom de la préparation"
              value={updatePrepaName}
              onChange={(e) => setUpdatePrepaName(e.target.value)}
            />
            {updatePrepaErrors.nom && <div className="invalid-feedback">{updatePrepaErrors.nom}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="updatePrepaDescription" className="form-label fw-medium">Description</label>
            <textarea
              id="updatePrepaDescription"
              className={`form-control ${updatePrepaErrors.description ? 'is-invalid' : ''}`}
              placeholder="Description"
              value={updatePrepaDescription}
              onChange={(e) => setUpdatePrepaDescription(e.target.value)}
              rows="3"
            />
            {updatePrepaErrors.description && <div className="invalid-feedback">{updatePrepaErrors.description}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="updatePrepaPrice" className="form-label fw-medium">Prix (XAF)</label>
            <input
              type="number"
              id="updatePrepaPrice"
              className={`form-control ${updatePrepaErrors.prix ? 'is-invalid' : ''}`}
              placeholder="Prix"
              value={updatePrepaPrice}
              onChange={(e) => setUpdatePrepaPrice(e.target.value)}
            />
            {updatePrepaErrors.prix && <div className="invalid-feedback">{updatePrepaErrors.prix}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="updatePrepaImage" className="form-label fw-medium">Nouvelle image de couverture</label>
            <input
              type="file"
              id="updatePrepaImage"
              className="form-control"
              onChange={(e) => setUpdatePrepaImage(e.target.files[0])}
            />
            <small className="form-text text-muted">Format recommandé: JPG ou PNG, max 2MB</small>
            {prepaImageError && <div className="text-danger mt-1">{prepaImageError}</div>}
          </div>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.light, borderTop: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowUpdatePrepaModal(false)}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={submitUpdatePrepa}
            disabled={!isUpdatePrepaFormValid()}
            style={{
              backgroundColor: theme.primary,
              borderColor: theme.primary,
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = theme.primaryDark;
              e.currentTarget.style.borderColor = theme.primaryDark;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary;
              e.currentTarget.style.borderColor = theme.primary;
            }}
          >
            Mettre à jour
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de suppression de préparation */}
      <Modal
        show={showDeletePrepaModal}
        onHide={() => setShowDeletePrepaModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: theme.light }}>
          <Modal.Title style={{ color: theme.dark, fontWeight: '600' }}>
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.light }}>
          <p>Êtes-vous sûr de vouloir supprimer cette préparation ? Cette action est irréversible et supprimera également toutes les disciplines associées.</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.light, borderTop: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeletePrepaModal(false)}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={executeDeletePrepa}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation de suppression de discipline */}
      <Modal
        show={showDeleteDisciplineModal}
        onHide={() => setShowDeleteDisciplineModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: theme.light }}>
          <Modal.Title style={{ color: theme.dark, fontWeight: '600' }}>
            Confirmer la suppression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: theme.light }}>
          <p>Êtes-vous sûr de vouloir supprimer cette discipline ? Cette action est irréversible et supprimera également tous les cours, exercices et anciens sujets associés.</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: theme.light, borderTop: 'none' }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteDisciplineModal(false)}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={executeDeleteDiscipline}
            style={{
              borderRadius: theme.buttonBorderRadius,
              transition: theme.transition
            }}
          >
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Admin;
