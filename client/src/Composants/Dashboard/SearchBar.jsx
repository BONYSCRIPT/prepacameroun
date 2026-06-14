import React, { forwardRef, useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';

// Styles pour la barre de recherche
const searchStyles = {
  searchContainer: {
    marginBottom: '15px',
    position: 'relative',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: 1010
  },
  searchInput: {
    padding: '10px 15px 10px 40px',
    width: '100%',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
    fontSize: '1.2rem'
  }
};

const SearchBar = forwardRef(({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Rechercher une préparation...",
  primaryColor = '#be0050',
  primaryRgb = '190, 0, 80'
}, ref) => {
  // État local pour gérer la valeur de l'input
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Synchroniser l'état local avec la prop searchTerm
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);
  
  // Gestionnaire de changement local
  const handleLocalChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange(e); // Propager le changement au parent
  };
  
  return (
    <div style={searchStyles.searchContainer}>
      <MdSearch style={searchStyles.searchIcon} />
      <input
        type="text"
        placeholder={placeholder}
        value={localSearchTerm}
        onChange={handleLocalChange}
        style={searchStyles.searchInput}
        ref={ref}
        onFocus={(e) => {
          e.target.style.boxShadow = `0 0 0 3px rgba(${primaryRgb}, 0.2)`;
          e.target.style.borderColor = primaryColor;
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'none';
          e.target.style.borderColor = '#e0e0e0';
        }}
      />
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
