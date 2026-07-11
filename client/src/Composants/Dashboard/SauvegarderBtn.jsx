import { useState, useEffect } from 'react';
import { savePrepaForOffline, removeOfflinePrepa, isPrepaAvailableOffline } from '../../services/offlineCache';
import { getDisciplinesByPrepa, getLeconsByDiscipline, getExercicesByDiscipline, getAnciensSujetsByDiscipline, getPrepaById } from '../../services/firestoreService';
import { toast } from 'react-toastify';

const SauvegarderBtn = ({ prepaId, expirationDate, prepaNom }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    const check = async () => {
      const available = await isPrepaAvailableOffline(prepaId);
      setIsSaved(available);
    };
    if (prepaId) check();
  }, [prepaId]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setProgress('Chargement de la prparation...');

    try {
      // 1. Rcuprer les infos de la prpa
      const prepa = await getPrepaById(prepaId);
      if (!prepa) throw new Error('Prparation introuvable');

      setProgress('Chargement des disciplines...');

      // 2. Rcuprer les disciplines
      const disciplines = await getDisciplinesByPrepa(prepaId);

      // 3. Pour chaque discipline, rcuprer leons, exercices, sujets
      const lecons = {};
      const exercices = {};
      const anciensSujets = {};

      for (let i = 0; i < disciplines.length; i++) {
        const disc = disciplines[i];
        setProgress(`Chargement du contenu (${i + 1}/${disciplines.length})...`);

        lecons[disc.id] = await getLeconsByDiscipline(disc.id);
        exercices[disc.id] = await getExercicesByDiscipline(disc.id);
        anciensSujets[disc.id] = await getAnciensSujetsByDiscipline(disc.id);
      }

      setProgress('Sauvegarde dans le cache...');

      // 4. Tout sauvegarder dans IndexedDB
      const result = await savePrepaForOffline(prepaId, {
        prepa,
        disciplines,
        lecons,
        exercices,
        anciensSujets
      }, expirationDate);

      if (result.success) {
        setIsSaved(true);
        toast.success(`"${prepaNom || 'Prpa'}" sauvegarde pour consultation hors-ligne`);
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setIsSaving(false);
      setProgress('');
    }
  };

  const handleRemove = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await removeOfflinePrepa(prepaId);
      setIsSaved(false);
      toast.info(`"${prepaNom || 'Prpa'}" retire du cache hors-ligne`);
    } catch (error) {
      toast.error('Erreur lors de la suppression: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return (
      <button
        className="btn btn-sm w-100"
        disabled
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          borderRadius: '8px',
          padding: '8px 12px',
          fontWeight: '500',
          fontSize: '0.85rem',
          border: 'none',
          cursor: 'not-allowed'
        }}
      >
        <span className="spinner-border spinner-border-sm me-2" role="status" />
        {progress || 'Sauvegarde en cours...'}
      </button>
    );
  }

  if (isSaved) {
    return (
      <button
        className="btn btn-sm w-100"
        onClick={handleRemove}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          borderRadius: '8px',
          padding: '8px 12px',
          fontWeight: '500',
          fontSize: '0.85rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc3545'; e.currentTarget.textContent = 'Supprimer du cache'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#28a745'; e.currentTarget.textContent = '✅ Sauvegarde'; }}
        title="Cliquez pour supprimer du cache hors-ligne"
      >
        ✅ Sauvegarde
      </button>
    );
  }

  return (
    <button
      className="btn btn-sm w-100"
      onClick={handleSave}
      style={{
        backgroundColor: '#17a2b8',
        color: 'white',
        borderRadius: '8px',
        padding: '8px 12px',
        fontWeight: '500',
        fontSize: '0.85rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#138496'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#17a2b8'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      💾 Sauvegarder pour consultation hors-ligne
    </button>
  );
};

export default SauvegarderBtn;