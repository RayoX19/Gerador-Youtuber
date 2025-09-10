
import React, { useState, useEffect } from 'react';

interface MobileModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[] | null;
    onEdit: (index: number) => void;
    onNew: () => void;
}

const MobileModal: React.FC<MobileModalProps> = ({ isOpen, onClose, images, onEdit, onNew }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
        }
    }, [isOpen]);

    if (!isOpen || !images || images.length === 0) return null;
    
    const downloadFromModal = () => {
        const imageSrc = images[currentIndex];
        if (!imageSrc) return;
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `ai-image-${Date.now()}-${currentIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const editFromModal = () => {
        onEdit(currentIndex);
        onClose();
    };
    
    const newImageFromModal = () => {
        onNew();
        onClose();
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 md:hidden">
            <div className="modal-content w-full max-w-md bg-gray-800 rounded-2xl p-4 flex flex-col items-center gap-4">
                <div className="relative w-full">
                    <img id="modalImage" src={images[currentIndex]} alt="Generated Art" className="modal-image w-full rounded-lg" />
                    {images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full text-lg leading-none">‹</button>
                            <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full text-lg leading-none">›</button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
                <div id="modal-actions" className="modal-actions grid grid-cols-3 gap-2 w-full">
                     <button className="modal-btn edit bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2" onClick={editFromModal}>
                        ✏️ Editar
                    </button>
                    <button className="modal-btn download bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2" onClick={downloadFromModal}>
                        💾 Salvar
                    </button>
                     <button className="modal-btn new bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2" onClick={newImageFromModal}>
                        ✨ Nova
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileModal;
