import React, { useState } from 'react';

const ImageUploader: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleUpload = () => {
        if (selectedImage) {
            // Aquí se puede implementar la lógica para subir la imagen al backend
            console.log('Imagen seleccionada:', selectedImage);
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={handleUpload} disabled={!selectedImage}>
                Subir Imagen
            </button>
        </div>
    );
};

export default ImageUploader;