const Button = ({ children, variant = 'primary', type = 'button', onClick, disabled, className = '', ...props }) => {
  const baseStyles = 'px-6 py-3 rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-white text-text-primary border border-border hover:border-text-primary',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-text-primary hover:bg-gray-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
