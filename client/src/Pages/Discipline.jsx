import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../Composants/Admin/AdminNavbar";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import LeconTab from "../Composants/Discipline/LeconTab";
import ExoTab from "../Composants/Discipline/ExoTab";
import AncienSujetTab from "../Composants/Discipline/AncienSujetTab";
import { getDisciplineById } from "../services/firestoreService";
import { toast } from "react-toastify";
import { MdArrowBack } from "react-icons/md";

const Discipline = () => {
  const { disciplineId } = useParams();
  const navigate = useNavigate();
  const [discipline, setDiscipline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("lecons");

  // Récupérer les informations de la discipline
  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        setLoading(true);
        const data = await getDisciplineById(disciplineId);
        setDiscipline(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération de la discipline:", error);
        toast.error("Erreur lors du chargement de la discipline");
        setLoading(false);
      }
    };

    if (disciplineId) {
      fetchDiscipline();
    }
  }, [disciplineId]);

  // Fonction de retour
  const handleBackClick = () => {
    navigate('/admin/dashboard');
  };

  // Fonction pour changer d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-white min-vh-100">
      <AdminNavbar />

      <div className="container-fluid mt-4 px-4">
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1">{discipline?.nom}</h2>
                <p className="text-muted mb-0">{discipline?.description}</p>
              </div>
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={handleBackClick}
              >
                <MdArrowBack /> Retour
              </button>
            </div>

            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "lecons" ? "active" : ""}`}
                  id="home-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#home-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="home-tab-pane"
                  aria-selected={activeTab === "lecons"}
                  onClick={() => handleTabChange("lecons")}
                >
                  Leçons
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "exercices" ? "active" : ""}`}
                  id="profile-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#profile-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="profile-tab-pane"
                  aria-selected={activeTab === "exercices"}
                  onClick={() => handleTabChange("exercices")}
                >
                  Exercices
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "anciensSujets" ? "active" : ""}`}
                  id="contact-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#contact-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="contact-tab-pane"
                  aria-selected={activeTab === "anciensSujets"}
                  onClick={() => handleTabChange("anciensSujets")}
                >
                  Anciens Sujets
                </button>
              </li>
            </ul>

            <div className="tab-content border border-top-0 rounded-bottom" id="myTabContent" style={{ height: '75vh', overflow: 'hidden' }}>
              <div
                className={`tab-pane fade ${activeTab === "lecons" ? "show active" : ""}`}
                id="home-tab-pane"
                role="tabpanel"
                aria-labelledby="home-tab"
                tabIndex="0"
                style={{ height: '100%' }}
              >
                <LeconTab disciplineId={disciplineId} />
              </div>
              <div
                className={`tab-pane fade ${activeTab === "exercices" ? "show active" : ""}`}
                id="profile-tab-pane"
                role="tabpanel"
                aria-labelledby="profile-tab"
                tabIndex="0"
                style={{ height: '100%' }}
              >
                <ExoTab disciplineId={disciplineId} />
              </div>
              <div
                className={`tab-pane fade ${activeTab === "anciensSujets" ? "show active" : ""}`}
                id="contact-tab-pane"
                role="tabpanel"
                aria-labelledby="contact-tab"
                tabIndex="0"
                style={{ height: '100%' }}
              >
                <AncienSujetTab disciplineId={disciplineId} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Discipline;
