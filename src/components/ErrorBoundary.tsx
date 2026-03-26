import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      
      try {
        const parsedError = JSON.parse(error?.message || '');
        if (parsedError.error) {
          errorMessage = `Erro de Permissão: ${parsedError.operationType} em ${parsedError.path}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-red-500">!</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Ops! Algo deu errado</h1>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
