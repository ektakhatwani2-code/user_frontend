const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const loader = (
    <div className={`${sizes[size]} border-gray-200 border-t-primary rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {loader}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{loader}</div>;
};

export default Loader;
