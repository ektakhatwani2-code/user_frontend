const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const variants = {
    primary: 'bg-primary text-white',
    sale: 'bg-sale text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    gray: 'bg-gray-500 text-white',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`inline-block rounded font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
