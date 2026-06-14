import PropTypes from 'prop-types';
import theme from '../../utils/theme';

/**
 * Composant d'input de formulaire réutilisable
 * @param {Object} props - Propriétés du composant
 * @returns {JSX.Element} - Élément JSX
 */
const FormInput = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  helpText,
  ...rest
}) => {
  // Déterminer si l'erreur doit être affichée (champ touché + erreur existante)
  const showError = touched && error;
  
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className={`form-label ${labelClassName}`}
          style={{ fontSize: theme.fonts.sizes.sm }}
        >
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-control ${showError ? 'is-invalid' : ''} ${inputClassName}`}
        aria-describedby={`${name}-help`}
        {...rest}
      />
      
      {helpText && (
        <div id={`${name}-help`} className="form-text" style={{ fontSize: theme.fonts.sizes.xs }}>
          {helpText}
        </div>
      )}
      
      {showError && (
        <div className="invalid-feedback" style={{ fontSize: theme.fonts.sizes.xs }}>
          {error}
        </div>
      )}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  touched: PropTypes.bool,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  helpText: PropTypes.string
};

export default FormInput;
