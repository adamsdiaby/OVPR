// Constantes pour la validation des images
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8
};

/**
 * Vérifie si le fichier est une image valide
 * @param {File} file - Le fichier à vérifier
 * @returns {Promise<{isValid: boolean, error: string|null}>}
 */
export const validateImage = async (file) => {
  // Vérifier le type de fichier
  if (!IMAGE_CONFIG.acceptedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Type de fichier non supporté. Types acceptés: ${IMAGE_CONFIG.acceptedTypes.join(', ')}`
    };
  }

  // Vérifier la taille du fichier
  if (file.size > IMAGE_CONFIG.maxSize) {
    return {
      isValid: false,
      error: `L'image est trop grande. Taille maximale: ${IMAGE_CONFIG.maxSize / (1024 * 1024)}MB`
    };
  }

  // Vérifier les dimensions de l'image
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width > IMAGE_CONFIG.maxWidth || dimensions.height > IMAGE_CONFIG.maxHeight) {
      return {
        isValid: false,
        error: `Les dimensions de l'image sont trop grandes. Maximum: ${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight}`
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Impossible de lire les dimensions de l'image"
    };
  }

  return { isValid: true, error: null };
};

/**
 * Obtient les dimensions d'une image
 * @param {File} file - Le fichier image
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Impossible de charger l'image"));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compresse une image
 * @param {File} file - Le fichier image à compresser
 * @returns {Promise<Blob>}
 */
export const compressImage = async (file) => {
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  let { width, height } = img;

  // Redimensionner si nécessaire
  if (width > IMAGE_CONFIG.maxWidth || height > IMAGE_CONFIG.maxHeight) {
    const ratio = Math.min(
      IMAGE_CONFIG.maxWidth / width,
      IMAGE_CONFIG.maxHeight / height
    );
    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  // Convertir en Blob avec compression
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      file.type,
      IMAGE_CONFIG.quality
    );
  });
};

/**
 * Prépare une image pour l'upload
 * @param {File} file - Le fichier image
 * @returns {Promise<{file: Blob|File, error: string|null}>}
 */
export const prepareImageForUpload = async (file) => {
  try {
    // Valider l'image
    const validation = await validateImage(file);
    if (!validation.isValid) {
      return { file: null, error: validation.error };
    }

    // Compresser l'image si nécessaire
    if (file.size > IMAGE_CONFIG.maxSize / 2) { // Compresser si > 2.5MB
      const compressedBlob = await compressImage(file);
      return {
        file: new File([compressedBlob], file.name, { type: file.type }),
        error: null
      };
    }

    return { file, error: null };
  } catch (error) {
    return { file: null, error: "Erreur lors du traitement de l'image" };
  }
};

export const prepareImageForUploadSimple = async (file) => {
  try {
    // Vérification de la taille
    if (file.size > IMAGE_CONFIG.maxSize) {
      throw new Error(`Le fichier dépasse la taille maximale de ${IMAGE_CONFIG.maxSize / (1024 * 1024)}MB`);
    }

    // Vérification du type
    if (!IMAGE_CONFIG.acceptedTypes.includes(file.type)) {
      throw new Error(`Type de fichier non supporté: ${file.type}`);
    }

    return { file, error: null };
  } catch (error) {
    return { file: null, error: error.message };
  }
};

export const processImage = async (image, edits) => {
  const { croppedAreaPixels, rotation, adjustments, filter } = edits;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Définir la taille du canvas
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    // Créer une image temporaire
    const img = new Image();
    img.onload = () => {
      // Appliquer la rotation
      if (rotation !== 0) {
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width/2, -canvas.height/2);
      }

      // Dessiner l'image recadrée
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Appliquer les ajustements
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Luminosité
        const brightness = adjustments.brightness / 100;
        data[i] *= brightness;     // R
        data[i + 1] *= brightness; // G
        data[i + 2] *= brightness; // B

        // Contraste
        const contrast = ((adjustments.contrast - 100) * 2.55) / 100;
        data[i] += contrast;     // R
        data[i + 1] += contrast; // G
        data[i + 2] += contrast; // B

        // Saturation
        const saturation = adjustments.saturation / 100;
        const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
        data[i] = gray + saturation * (data[i] - gray);     // R
        data[i + 1] = gray + saturation * (data[i + 1] - gray); // G
        data[i + 2] = gray + saturation * (data[i + 2] - gray); // B
      }

      ctx.putImageData(imageData, 0, 0);

      // Appliquer le filtre si nécessaire
      if (filter && filter !== 'none') {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        const filterImg = new Image();
        filterImg.onload = () => {
          tempCtx.filter = getFilterStyle(filter);
          tempCtx.drawImage(filterImg, 0, 0);
          resolve(tempCanvas.toDataURL('image/jpeg', 0.9));
        };
        filterImg.src = canvas.toDataURL();
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      }
    };

    img.src = image;
  });
};

const getFilterStyle = (filterName) => {
  switch (filterName) {
    case 'grayscale':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'vintage':
      return 'sepia(50%) contrast(120%) brightness(90%)';
    case 'warm':
      return 'saturate(150%) brightness(105%) contrast(110%)';
    case 'cool':
      return 'saturate(80%) brightness(105%) contrast(110%) hue-rotate(30deg)';
    default:
      return '';
  }
};
