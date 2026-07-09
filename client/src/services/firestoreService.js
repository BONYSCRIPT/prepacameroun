/**
 * firestoreService.js
 * Service centralisé pour toutes les opérations Firestore.
 * Remplace l'ensemble des routes API Express + MySQL du serveur original.
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// ============================================================
// UTILITAIRES
// ============================================================

/**
 * Redimensionne et convertit un fichier image en base64 pour le stocker dans Firestore.
 * Limite la taille à 200px de largeur max pour éviter de dépasser la limite Firestore (1 Mo).
 */
export const uploadImage = async (file, path) => {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en JPEG qualité 0.7 pour réduire la taille
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Supprime une image (base64) - pas d'action nécessaire car stockée dans Firestore.
 * La suppression se fait en mettant le champ image_url à null.
 */
export const deleteImage = async (imageUrl) => {
  // Les images base64 sont stockées dans Firestore, pas de suppression physique nécessaire
  return;
};

// ============================================================
// PRÉPARATIONS AUX CONCOURS (/prepa_concours)
// Remplace : /api/prepas, /api/prepas/:id, /api/prepas/published
// ============================================================

/** Récupère toutes les préparations (admin uniquement). */
export const getAllPrepas = async () => {
  const snapshot = await getDocs(collection(db, 'prepa_concours'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Récupère uniquement les préparations publiées (page d'accueil & dashboard). */
export const getPublishedPrepas = async () => {
  const q = query(
    collection(db, 'prepa_concours'),
    where('is_published', '==', true),
    orderBy('created_at', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Récupère une préparation par son ID. */
export const getPrepaById = async (prepaId) => {
  const docRef = doc(db, 'prepa_concours', prepaId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

/** Crée une nouvelle préparation avec image sur Storage. */
export const createPrepa = async ({ nom, description, prix, adminId, imageFile }) => {
  const imageUrl = imageFile ? await uploadImage(imageFile, 'prepas') : null;
  const newPrepa = {
    nom,
    description,
    prix: parseFloat(prix),
    created_by: adminId,
    is_published: false,
    image_url: imageUrl,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'prepa_concours'), newPrepa);
  return { id: docRef.id, ...newPrepa };
};

/** Met à jour une préparation existante. */
export const updatePrepa = async (prepaId, { nom, description, prix, imageFile, currentImageUrl }) => {
  let imageUrl = currentImageUrl;
  if (imageFile) {
    if (currentImageUrl) await deleteImage(currentImageUrl);
    imageUrl = await uploadImage(imageFile, 'prepas');
  }
  const updates = {};
  if (nom !== undefined) updates.nom = nom;
  if (description !== undefined) updates.description = description;
  if (prix !== undefined) updates.prix = parseFloat(prix);
  if (imageUrl !== undefined) updates.image_url = imageUrl;
  updates.updated_at = serverTimestamp();

  await updateDoc(doc(db, 'prepa_concours', prepaId), updates);
  return { id: prepaId, ...updates };
};

/** Bascule le statut de publication d'une préparation. */
export const togglePublishPrepa = async (prepaId, currentStatus) => {
  const newStatus = !currentStatus;
  await updateDoc(doc(db, 'prepa_concours', prepaId), { is_published: newStatus });
  return newStatus;
};

/** Supprime une préparation et son image. */
export const deletePrepa = async (prepaId) => {
  const prepa = await getPrepaById(prepaId);
  if (prepa?.image_url) await deleteImage(prepa.image_url);
  await deleteDoc(doc(db, 'prepa_concours', prepaId));
};

// ============================================================
// DISCIPLINES (/disciplines)
// Remplace : /api/disciplines, /api/disciplines-user/prepa/:prepaId
// ============================================================

/** Récupère toutes les disciplines d'une préparation. */
export const getDisciplinesByPrepa = async (prepaId) => {
  if (!prepaId) {
    console.warn('getDisciplinesByPrepa: prepaId est undefined');
    return [];
  }
  const q = query(
    collection(db, 'disciplines'),
    where('prepa_concours_id', '==', prepaId),
    orderBy('nom', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Récupère toutes les disciplines (admin). */
export const getAllDisciplines = async () => {
  const snapshot = await getDocs(collection(db, 'disciplines'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Récupère une discipline par son ID. */
export const getDisciplineById = async (disciplineId) => {
  const docRef = doc(db, 'disciplines', disciplineId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

/** Crée une discipline. */
export const createDiscipline = async ({ nom, description, prepaConcoursId, imageFile }) => {
  const imageUrl = imageFile ? await uploadImage(imageFile, 'disciplines') : null;
  const newDiscipline = {
    nom,
    description,
    prepa_concours_id: prepaConcoursId,
    image_url: imageUrl,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'disciplines'), newDiscipline);
  return { id: docRef.id, ...newDiscipline };
};

/** Met à jour une discipline. */
export const updateDiscipline = async (disciplineId, { nom, description, imageFile, currentImageUrl }) => {
  let imageUrl = currentImageUrl;
  if (imageFile) {
    if (currentImageUrl) await deleteImage(currentImageUrl);
    imageUrl = await uploadImage(imageFile, 'disciplines');
  }
  const updates = { nom, description, image_url: imageUrl, updated_at: serverTimestamp() };
  await updateDoc(doc(db, 'disciplines', disciplineId), updates);
  return { id: disciplineId, ...updates };
};

/** Supprime une discipline. */
export const deleteDiscipline = async (disciplineId) => {
  const discipline = await getDisciplineById(disciplineId);
  if (discipline?.image_url) await deleteImage(discipline.image_url);
  await deleteDoc(doc(db, 'disciplines', disciplineId));
};

// ============================================================
// LEÇONS (/lecons)
// Remplace : /api/lecons/discipline/:disciplineId
// ============================================================

/** Récupère les leçons d'une discipline, triées par numéro de page. */
export const getLeconsByDiscipline = async (disciplineId) => {
  const q = query(
    collection(db, 'lecons'),
    where('discipline_id', '==', disciplineId),
    orderBy('numero_page', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Crée une leçon. */
export const createLecon = async ({ titre, contenu, disciplineId, numeroPage }) => {
  const newLecon = {
    titre,
    contenu,
    discipline_id: disciplineId,
    numero_page: numeroPage,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'lecons'), newLecon);
  return { id: docRef.id, ...newLecon };
};

/** Met à jour une leçon. */
export const updateLecon = async (leconId, { titre, contenu, numeroPage }) => {
  const updates = { titre, contenu, numero_page: numeroPage, updated_at: serverTimestamp() };
  await updateDoc(doc(db, 'lecons', leconId), updates);
  return { id: leconId, ...updates };
};

/** Supprime une leçon. */
export const deleteLecon = async (leconId) => {
  await deleteDoc(doc(db, 'lecons', leconId));
};

// ============================================================
// EXERCICES (/exercices)
// Remplace : /api/exercices/discipline/:disciplineId
// ============================================================

/** Récupère les exercices d'une discipline, triés par numéro de page. */
export const getExercicesByDiscipline = async (disciplineId) => {
  const q = query(
    collection(db, 'exercices'),
    where('discipline_id', '==', disciplineId),
    orderBy('numero_page', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Crée un exercice. */
export const createExercice = async ({ titre, enonce, corrige, disciplineId, numeroPage }) => {
  const newExercice = {
    titre,
    enonce,
    corrige,
    discipline_id: disciplineId,
    numero_page: numeroPage,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'exercices'), newExercice);
  return { id: docRef.id, ...newExercice };
};

/** Met à jour un exercice. */
export const updateExercice = async (exerciceId, { titre, enonce, corrige, numeroPage }) => {
  const updates = { titre, enonce, corrige, numero_page: numeroPage, updated_at: serverTimestamp() };
  await updateDoc(doc(db, 'exercices', exerciceId), updates);
  return { id: exerciceId, ...updates };
};

/** Supprime un exercice. */
export const deleteExercice = async (exerciceId) => {
  await deleteDoc(doc(db, 'exercices', exerciceId));
};

// ============================================================
// ANCIENS SUJETS (/anciens_sujets)
// Remplace : /api/anciens-sujets/discipline/:disciplineId
// ============================================================

/** Récupère les anciens sujets d'une discipline, triés par numéro de page. */
export const getAnciensSujetsByDiscipline = async (disciplineId) => {
  const q = query(
    collection(db, 'anciens_sujets'),
    where('discipline_id', '==', disciplineId),
    orderBy('numero_page', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Crée un ancien sujet. */
export const createAncienSujet = async ({ annee, titre, contenu, corrige, disciplineId, numeroPage }) => {
  const newSujet = {
    annee,
    titre,
    contenu,
    corrige,
    discipline_id: disciplineId,
    numero_page: numeroPage,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'anciens_sujets'), newSujet);
  return { id: docRef.id, ...newSujet };
};

/** Met à jour un ancien sujet. */
export const updateAncienSujet = async (sujetId, { annee, titre, contenu, corrige, numeroPage }) => {
  const updates = { annee, titre, contenu, corrige, numero_page: numeroPage, updated_at: serverTimestamp() };
  await updateDoc(doc(db, 'anciens_sujets', sujetId), updates);
  return { id: sujetId, ...updates };
};

/** Supprime un ancien sujet. */
export const deleteAncienSujet = async (sujetId) => {
  await deleteDoc(doc(db, 'anciens_sujets', sujetId));
};

// ============================================================
// INSCRIPTIONS (/inscriptions)
// Remplace : /api/inscriptions/user/inscriptions, /api/inscriptions/check-and-update
// ============================================================

/** Récupère les inscriptions actives d'un utilisateur avec les infos de la préparation. */
export const getUserInscriptions = async (userId) => {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'inscriptions'),
    where('user_id', '==', userId),
    where('statut', '==', 'active')
  );
  const snapshot = await getDocs(q);
  const inscriptions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  // Vérifier et expirer les inscriptions dépassées localement
  const batch = writeBatch(db);
  let hasExpired = false;
  inscriptions.forEach(ins => {
    if (ins.date_expiration && ins.date_expiration.toDate() <= new Date()) {
      batch.update(doc(db, 'inscriptions', ins.id), { statut: 'expirée' });
      hasExpired = true;
    }
  });
  if (hasExpired) await batch.commit();

  // Filtrer les actives non-expirées
  const activeInscriptions = inscriptions.filter(ins => {
    if (!ins.date_expiration) return false;
    return ins.date_expiration.toDate() > new Date();
  });

  // Enrichir chaque inscription avec les données de la préparation (nom, description, image_url)
  const enriched = await Promise.all(activeInscriptions.map(async (ins) => {
    try {
      const prepaDoc = await getDoc(doc(db, 'prepa_concours', ins.prepa_id));
      if (prepaDoc.exists()) {
        const prepaData = prepaDoc.data();
        return {
          ...ins,
          nom: prepaData.nom || 'Sans nom',
          description: prepaData.description || '',
          image_url: prepaData.image_url || null
        };
      }
    } catch (e) {
      console.warn(`Impossible de charger la prépa ${ins.prepa_id}:`, e);
    }
    return { ...ins, nom: 'Sans nom', description: '', image_url: null };
  }));

  return enriched;
};

/** Vérifie si un utilisateur est inscrit à une préparation spécifique. */
export const checkUserInscription = async (userId, prepaId) => {
  const q = query(
    collection(db, 'inscriptions'),
    where('user_id', '==', userId),
    where('prepa_id', '==', prepaId),
    where('statut', '==', 'active')
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  const ins = snapshot.docs[0].data();
  if (!ins.date_expiration) return false;
  return ins.date_expiration.toDate() > new Date();
};

// ============================================================
// UTILISATEURS (/users)
// Remplace : /api/users/firebaselogin
// ============================================================

/** Récupère ou crée un utilisateur dans Firestore après connexion Firebase. */
export const getOrCreateUser = async (firebaseUser) => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Mettre à jour last_login
    await updateDoc(userRef, { last_login: serverTimestamp() });
    return { id: firebaseUser.uid, ...userSnap.data() };
  }

  // Créer le profil utilisateur dans Firestore
  const newUser = {
    id: firebaseUser.uid,
    username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
    email: firebaseUser.email,
    avatar_url: firebaseUser.photoURL || null,
    provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'local',
    email_verified: firebaseUser.emailVerified,
    firebase_uid: firebaseUser.uid,
    created_at: serverTimestamp(),
    last_login: serverTimestamp(),
  };
  await setDoc(userRef, newUser);
  return newUser;
};

// ============================================================
// ADMINS (/admins)
// ============================================================

/** Vérifie si un utilisateur Firebase est un administrateur. */
export const checkIfAdmin = async (uid) => {
  try {
    const adminRef = doc(db, 'admins', uid);
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) return null;
    return { id: adminSnap.id, ...adminSnap.data() };
  } catch (error) {
    console.error('Erreur checkIfAdmin:', error);
    return null;
  }
};

/** Crée un compte admin dans Firestore (remplace le formulaire d'inscription admin). */
export const createAdmin = async ({ username, email, firebaseUid, role = 'admin' }) => {
  const adminRef = doc(db, 'admins', firebaseUid);
  const newAdmin = {
    username,
    email,
    firebase_uid: firebaseUid,
    role,
    created_at: serverTimestamp(),
  };
  await setDoc(adminRef, newAdmin);
  return { id: firebaseUid, ...newAdmin };
};

// ============================================================
// NOTIFICATIONS (/notifications)
// ============================================================

/** Récupère les notifications d'un utilisateur. */
export const getUserNotifications = async (userId) => {
  const q = query(
    collection(db, 'notifications'),
    where('user_id', '==', userId),
    orderBy('date_creation', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Marque une notification comme lue. */
export const markNotificationAsRead = async (notificationId) => {
  await updateDoc(doc(db, 'notifications', notificationId), { lu: true });
};

/** Supprime une notification. */
export const markNotificationRead = async (notificationId) => {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, { lu: true });
};

/** Marque toutes les notifications d'un utilisateur comme lues. */
export const markAllNotificationsRead = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Utilisateur non connecté');
  const q = query(collection(db, 'notifications'), where('user_id', '==', user.uid), where('lu', '==', false));
  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { lu: true }));
  await Promise.all(updates);
};

export const deleteNotification = async (notificationId) => {
  await deleteDoc(doc(db, 'notifications', notificationId));
};
