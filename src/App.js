
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [imageVariants, setImageVariants] = useState({});
  const [activePopup, setActivePopup] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('https://3523110229-marco5b-api.refaccionariayserviciosxpress.online/images');
      setImages(response.data.result);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://3523110229-marco5b-api.refaccionariayserviciosxpress.online/images/upload', formData);
      const uploadedImage = response.data.result;
      setImages(prev => [...prev, uploadedImage]);
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://3523110229-marco5b-api.refaccionariayserviciosxpress.online/images/delete/${id}`);
      setImages(prev => prev.filter(image => image.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getImageUrl = (id, variant = 'public') =>
    `https://imagedelivery.net/TPsRWPb0UxmJY8hM0hdi-A/${id}/${variant}`;

  const changeVariant = (id, variant) => {
    setImageVariants(prev => ({ ...prev, [id]: variant }));
    setActivePopup(null);
  };

  const openImageModal = (id) => {
    const variant = imageVariants[id] || 'public';
    const url = getImageUrl(id, variant);
    setModalImage({ url, variant });
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  return (
    <div className="gallery-container">
      <h1 className="gallery-title">Galería de Imágenes</h1>

      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Subir Imagen</button>
      </div>

      <div className="image-grid">
        {images.map((image, index) => {
          const currentVariant = imageVariants[image.id] || 'public';
          return (
            <div key={index} className="image-card">
              <img
                src={getImageUrl(image.id, currentVariant)}
                alt={`Imagen ${index}`}
                className="image"
              />
              <div className="variant-label">Variante: {currentVariant}</div>

              <button
                className="variant-select-button"
                onClick={() => setActivePopup(image.id)}
              >
                Elegir tamaño
              </button>

              <button
                className="variant-select-button"
                onClick={() => openImageModal(image.id)}
              >
                Ver imagen
              </button>

              {activePopup === image.id && (
                <div className="variant-popup">
                  <div className="popup-title">Selecciona un tamaño:</div>
                  <button onClick={() => changeVariant(image.id, 'small')}>250x250</button>
                  <button onClick={() => changeVariant(image.id, 'medium')}>500x500</button>
                  <button onClick={() => changeVariant(image.id, 'public')}>750x750</button>
                  <button className="close-popup" onClick={() => setActivePopup(null)}>Cerrar</button>
                </div>
              )}

              <button className="delete-button" onClick={() => handleDelete(image.id)}>Eliminar</button>
            </div>
          );
        })}
      </div>

      {modalImage && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage.url} alt="Imagen ampliada" className="modal-image" />
            <div className="modal-footer">Tamaño seleccionado: {modalImage.variant}</div>
            <button className="close-modal" onClick={closeImageModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
