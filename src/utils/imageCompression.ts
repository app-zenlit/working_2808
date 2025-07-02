/**
 * Image compression utility for post uploads
 * Compresses images to stay within 350KB - 800KB range while maintaining quality
 */

export interface CompressionOptions {
  minSizeKB: number;
  maxSizeKB: number;
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  qualityStep?: number;
  minQuality?: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  compressionRatio: number;
  quality: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  minSizeKB: 350,
  maxSizeKB: 800,
  maxWidth: 1920,
  maxHeight: 1920,
  initialQuality: 0.8,
  qualityStep: 0.1,
  minQuality: 0.3
};

/**
 * Convert file size from bytes to KB
 */
const bytesToKB = (bytes: number): number => Math.round(bytes / 1024);

/**
 * Create a canvas and draw the image with specified dimensions and quality
 */
const createCompressedImage = (
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
  format: string = 'image/jpeg'
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    canvas.width = width;
    canvas.height = height;

    // Use high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the image
    ctx.drawImage(image, 0, 0, width, height);

    // Convert to blob with specified quality
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      format,
      quality
    );
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Calculate scaling factor to fit within max dimensions
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const scalingFactor = Math.min(widthRatio, heightRatio, 1); // Don't upscale

  width = Math.round(width * scalingFactor);
  height = Math.round(height * scalingFactor);

  return { width, height };
};

/**
 * Load image from file
 */
const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    image.src = url;
  });
};

/**
 * Compress image to target size range using iterative quality adjustment
 */
export const compressImage = async (
  file: File,
  options: Partial<CompressionOptions> = {},
  onProgress?: (progress: { stage: string; quality?: number; sizeKB?: number }) => void
): Promise<CompressionResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSizeKB = bytesToKB(file.size);

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Support JPEG and PNG
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Only JPEG and PNG images are supported');
  }

  // If image is already in target range, return as-is
  if (originalSizeKB >= opts.minSizeKB && originalSizeKB <= opts.maxSizeKB) {
    onProgress?.({ stage: 'Already optimized', sizeKB: originalSizeKB });
    return {
      compressedFile: file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      compressionRatio: 1,
      quality: 1
    };
  }

  onProgress?.({ stage: 'Loading image...' });

  // Load the image
  const image = await loadImageFromFile(file);

  // Calculate optimal dimensions
  const { width, height } = calculateOptimalDimensions(
    image.naturalWidth,
    image.naturalHeight,
    opts.maxWidth!,
    opts.maxHeight!
  );

  onProgress?.({ stage: 'Optimizing size...', quality: opts.initialQuality });

  // Determine output format (prefer JPEG for better compression)
  const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  
  let currentQuality = opts.initialQuality!;
  let bestBlob: Blob | null = null;
  let bestQuality = currentQuality;
  let attempts = 0;
  const maxAttempts = 10;

  // Iterative compression to hit target size
  while (attempts < maxAttempts) {
    attempts++;
    
    onProgress?.({ 
      stage: 'Compressing...', 
      quality: currentQuality,
    });

    const blob = await createCompressedImage(image, width, height, currentQuality, outputFormat);
    const sizeKB = bytesToKB(blob.size);

    onProgress?.({ 
      stage: 'Compressing...', 
      quality: currentQuality,
      sizeKB 
    });

    // Check if we're in the target range
    if (sizeKB >= opts.minSizeKB && sizeKB <= opts.maxSizeKB) {
      bestBlob = blob;
      bestQuality = currentQuality;
      break;
    }

    // Store the best result so far (closest to target range)
    if (!bestBlob || 
        (sizeKB <= opts.maxSizeKB && sizeKB > bytesToKB(bestBlob.size)) ||
        (bestBlob && bytesToKB(bestBlob.size) > opts.maxSizeKB && sizeKB < bytesToKB(bestBlob.size))) {
      bestBlob = blob;
      bestQuality = currentQuality;
    }

    // Adjust quality based on current size
    if (sizeKB > opts.maxSizeKB) {
      // Too large, reduce quality
      currentQuality = Math.max(currentQuality - opts.qualityStep!, opts.minQuality!);
    } else if (sizeKB < opts.minSizeKB) {
      // Too small, increase quality
      currentQuality = Math.min(currentQuality + opts.qualityStep!, 1);
    }

    // If we've hit quality limits, break
    if (currentQuality <= opts.minQuality! || currentQuality >= 1) {
      break;
    }
  }

  if (!bestBlob) {
    throw new Error('Failed to compress image');
  }

  onProgress?.({ stage: 'Finalizing...', sizeKB: bytesToKB(bestBlob.size) });

  // Create final file
  const compressedSizeKB = bytesToKB(bestBlob.size);
  const fileName = file.name.replace(/\.[^/.]+$/, '') + (outputFormat === 'image/jpeg' ? '.jpg' : '.png');
  
  const compressedFile = new File([bestBlob], fileName, {
    type: outputFormat,
    lastModified: Date.now()
  });

  return {
    compressedFile,
    originalSizeKB,
    compressedSizeKB,
    compressionRatio: originalSizeKB / compressedSizeKB,
    quality: bestQuality
  };
};

/**
 * Validate image file before compression
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!supportedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Only JPEG and PNG images are supported' };
  }

  // Check file size (max 50MB for input)
  const maxInputSizeMB = 50;
  if (file.size > maxInputSizeMB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${maxInputSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (sizeKB: number): string => {
  if (sizeKB < 1024) {
    return `${sizeKB} KB`;
  }
  return `${(sizeKB / 1024).toFixed(1)} MB`;
};