interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const Loader = ({ message = "Loading...", fullScreen = false }: LoaderProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      {message && (
        <p className="text-sm font-medium text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{content}</div>;
};

export default Loader;
