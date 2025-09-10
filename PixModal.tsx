import React, { useState } from 'react';

interface PixModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const FAKE_PIX_CODE = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913NOME DO VENDEDOR6008BRASILIA62070503***6304E4A9";

const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleConfirmPayment = () => {
        setIsConfirming(true);
        // Simulate API call to check payment status
        setTimeout(() => {
            onSuccess();
            setIsConfirming(false);
        }, 2500);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(FAKE_PIX_CODE);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl text-white w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-2 text-yellow-400">✨ Acesso Ilimitado</h2>
                <p className="text-gray-300 mb-4">Finalize o pagamento via PIX para gerar vídeos sem limites.</p>

                <div className="bg-white p-4 rounded-lg inline-block">
                    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#000" d="M0 0h200v200H0z"/>
                        <path fill="#FFF" d="M40 40h40v40H40zm80 0h40v40h-40zM40 120h40v40H40zm50-30h20v20h-20zm-30 0h20v20H60zm60 0h20v20h-20zm-30 30h20v20h-20zM70 70h20v20H70zm60 0h20v20h-20zm-30-30h20v20h-20zm-10 80h20v20h-20zm30 10h20v20h-20zm-50-20h20v20H70zm20-20h20v20H90zm20 20h20v20h-20z"/>
                        <path fill="#000" d="M60 60h20v20H60zm80 0h20v20h-20zM60 140h20v20H60z"/>
                    </svg>
                </div>
                
                <p className="text-gray-400 mt-4 mb-2 text-sm">Ou use o PIX Copia e Cola:</p>

                <div className="relative">
                    <input 
                        type="text" 
                        readOnly 
                        value={FAKE_PIX_CODE}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 pr-16 text-xs text-gray-400 truncate"
                    />
                    <button 
                        onClick={handleCopy}
                        className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold py-1 px-2 rounded hover:bg-indigo-500 transition-colors"
                    >
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                </div>
                
                <div className="flex flex-col gap-4 mt-6">
                    <button 
                        onClick={handleConfirmPayment} 
                        className="w-full py-3 px-4 rounded bg-green-600 hover:bg-green-500 transition-colors font-bold flex items-center justify-center disabled:opacity-50"
                        disabled={isConfirming}
                    >
                         {isConfirming ? (
                            <>
                                <div className="spinner w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                                Verificando...
                            </>
                         ) : (
                            'Já paguei, verificar'
                         )}
                    </button>
                    <button onClick={onClose} className="py-2 px-4 rounded bg-gray-600/50 hover:bg-gray-600 transition-colors text-sm">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PixModal;
