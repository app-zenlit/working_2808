import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { generateId } from '../utils/generateId';
import { supabase } from '../lib/supabase';
import { uploadPostImage } from '../lib/storage';
import { generatePlaceholderImage, checkStorageAvailability } from '../lib/storage';
import { createPost } from '../lib/posts';
import { compressImage, validateImageFile, formatFileSize, CompressionResult } from '../utils/imageCompression';
import { ImageCompressionModal } from '../components/common/ImageCompressionModal';

interface Props {
  onBack?: () => void; // Add back button handler
}

export const CreatePostScreen: React.FC<Props> = ({ onBack }) => {
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState<{
    available: boolean;
    message: string;
  }>({ available: true, message: '' });
  
  // Image compression states
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<{
    stage: string;
    quality?: number;
    sizeKB?: number;
  }>({ stage: '' });
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user data and check storage
  useEffect(() => {
    loadCurrentUser();
    checkStorage();
  }, []);

  const checkStorage = async () => {
    try {
      const status = await checkStorageAvailability();
      setStorageStatus({
        available: status.postsAvailable,
        message: status.message
      });
    } catch (error) {
      console.error('Storage check error:', error);
      setStorageStatus({
        available: true, // Default to true to avoid blocking functionality
        message: 'Storage status unknown, proceeding normally.'
      });
    }
  };

  const loadCurrentUser = async () => {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not available, using offline mode');
        // Set a default user for offline mode
        setCurrentUser({
          id: 'offline-user',
          name: 'Offline User',
          profile_photo_url: null
        });
        setIsLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        setIsLoading(false);
        return;
      }

      // If no profile exists, create one
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
            email: user.email,
            bio: 'New to Zenlit! 👋',
            created_at: new Date().toISOString()
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Profile creation error:', createError);
          setIsLoading(false);
          return;
        }

        setCurrentUser(newProfile);
      } else {
        setCurrentUser(profile);
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!selectedFile && !caption.trim()) {
      alert('Please add some content to your post');
      return;
    }

    if (!currentUser) {
      alert('Please log in to create a post');
      return;
    }
    
    setIsPosting(true);
    
    try {
      let mediaUrl = '';
      
      // If we have a compressed file, upload it directly to Supabase
      if (selectedFile) {
        if (storageStatus.available) {
          console.log('Uploading compressed image to Supabase...');
          
          try {
            // Generate a unique filename
            const fileName = `${generateId()}.${selectedFile.name.split('.').pop() || 'jpg'}`;
            const filePath = `${currentUser.id}/${fileName}`;
            
            // Upload the compressed file directly to Supabase
            const uploadedPath = await uploadPostImage(selectedFile, filePath);
            
            // Get the public URL for the uploaded file
            const { data: urlData } = supabase.storage.from('posts').getPublicUrl(uploadedPath);
            
            if (!urlData?.publicUrl) {
              throw new Error('Failed to get public URL for uploaded image');
            }
            
            mediaUrl = urlData.publicUrl;
            console.log('Image uploaded successfully:', mediaUrl);
            console.log('Final file size:', formatFileSize(Math.round(selectedFile.size / 1024)));
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            mediaUrl = generatePlaceholderImage();
          }
        } else {
          console.warn('Storage not available, using placeholder image');
          mediaUrl = generatePlaceholderImage();
        }
      } else {
        // If no media selected, use a placeholder
        mediaUrl = generatePlaceholderImage();
      }

      // Create post using the posts service
      const newPost = await createPost({
        title: `Post by ${currentUser.name}`,
        caption: caption.trim() || 'New post from Zenlit!',
        mediaUrl: mediaUrl,
        mediaType: 'image'
      });

      if (!newPost) {
        throw new Error('Failed to create post');
      }

      console.log('Post created successfully:', newPost);
      
      setIsPosting(false);
      setShowSuccess(true);
      
      // Reset form after success animation
      setTimeout(() => {
        setCaption('');
        setSelectedMedia(null);
        setSelectedFile(null);
        setCompressionResult(null);
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Post creation error:', error);
      setIsPosting(false);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('storage') || error.message.includes('bucket')) {
          alert('Image upload is currently unavailable. Your post was created with a placeholder image.');
        } else if (error.message.includes('posts') || error.message.includes('database')) {
          alert('Failed to save post. Please try again.');
        } else {
          alert(`Failed to create post: ${error.message}`);
        }
      } else {
        alert('Failed to create post. Please try again.');
      }
    }
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const originalSizeKB = Math.round(file.size / 1024);
    console.log('Processing image:', file.name, formatFileSize(originalSizeKB));

    try {
      setIsCompressing(true);
      setCompressionProgress({ stage: 'Starting compression...' });

      // Compress the image
      const result = await compressImage(
        file,
        {
          minSizeKB: 350,
          maxSizeKB: 800,
          maxWidth: 1920,
          maxHeight: 1920
        },
        (progress) => {
          setCompressionProgress(progress);
        }
      );

      setCompressionResult(result);

      // Store the compressed file for later upload
      setSelectedFile(result.compressedFile);
      
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(result.compressedFile);
      setSelectedMedia(previewUrl);

      console.log('Compression complete:', {
        original: formatFileSize(result.originalSizeKB),
        compressed: formatFileSize(result.compressedSizeKB),
        ratio: `${result.compressionRatio.toFixed(1)}x`,
        quality: `${Math.round(result.quality * 100)}%`
      });

    } catch (error) {
      console.error('Image compression error:', error);
      alert(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleMediaSelect = (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      startCamera();
    } else {
      openGallery();
    }
  };

  const removeMedia = () => {
    if (selectedMedia && selectedMedia.startsWith('blob:')) {
      URL.revokeObjectURL(selectedMedia);
    }
    setSelectedMedia(null);
    setSelectedFile(null);
    setCompressionResult(null);
  };

  // Show loading if user not loaded yet
  if (isLoading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if no user available
  if (!currentUser) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Profile</h2>
          <p className="text-gray-400">Please try refreshing the page or logging in again.</p>
        </div>
      </div>
    );
  }

  // Success Animation Component
  if (showSuccess) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Post Shared!</h2>
          <p className="text-gray-400">Your post has been saved successfully</p>
          {compressionResult && (
            <div className="mt-4 text-sm text-gray-500">
              <p>Image optimized: {formatFileSize(compressionResult.originalSizeKB)} → {formatFileSize(compressionResult.compressedSizeKB)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Camera Error Display
  if (cameraError) {
    return (
      <div className="h-full bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Camera Error</h2>
          <p className="text-gray-300 mb-6">{cameraError}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setCameraError(null);
                startCamera();
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => setCameraError(null)}
              className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 active:scale-95 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera Preview Component
  if (showCamera) {
    return (
      <div className="h-full bg-black flex flex-col">
        {/* Camera Header */}
        <div className="camera-header flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
          <button
            onClick={stopCamera}
            className="text-white p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Take Photo</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Camera Preview */}
        <div className="flex-1 relative overflow-hidden bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(1)' }} /* Ensure proper orientation */
            onError={(e) => {
              console.error('Video error:', e);
              setCameraError('Failed to load camera preview');
            }}
          />

          {!fullscreenSupported && (
            <div className="orientation-hint">Rotate your device or tap Close Preview to exit.</div>
          )}
          
          {/* Camera Controls */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 active:scale-95 transition-all shadow-lg flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black">
      {/* Image Compression Modal */}
      <ImageCompressionModal
        isOpen={isCompressing}
        onClose={() => setIsCompressing(false)}
        progress={compressionProgress}
        originalSizeKB={selectedFile ? Math.round(selectedFile.size / 1024) : undefined}
      />

      {/* Camera Denied Banner */}
      <PermissionDeniedBanner
        isVisible={showCameraDeniedBanner}
        permissionType="Camera"
        onDismiss={() => setShowCameraDeniedBanner(false)}
        onRetry={() => {
          setShowCameraDeniedBanner(false)
          startCamera()
        }}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>
            )}
            <h1 className="text-xl font-bold text-white">Create Post</h1>
          </div>
          <button
            onClick={handlePost}
            disabled={(!selectedMedia && !caption.trim()) || isPosting || isCompressing}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPosting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sharing...
              </>
            ) : (
              'Share'
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Storage Status Info (only show if there might be issues) */}
        {!storageStatus.available && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-300 mb-1">Storage Info</h3>
                <p className="text-xs text-blue-200">
                  {storageStatus.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.profile_photo_url || '/images/default-avatar.png'}
            alt="Your profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
          />
          <div>
            <h3 className="font-semibold text-white">{currentUser.name}</h3>
          </div>
        </div>

        {/* Caption Input */}
        <div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-32 px-0 py-0 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none resize-none text-lg"
            maxLength={500}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${caption.length > 450 ? 'text-red-400' : 'text-gray-400'}`}>
              {caption.length}/500
            </span>
          </div>
        </div>

        {/* Selected Media Preview */}
        {selectedMedia && (
          <div className="relative">
            <img
              src={selectedMedia}
              alt="Selected media"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/80 active:scale-95 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            {/* Compression Info */}
            {compressionResult && (
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-xs text-white">
                  Optimized: {formatFileSize(compressionResult.compressedSizeKB)}
                  {compressionResult.compressionRatio > 1 && (
                    <span className="text-green-400 ml-1">
                      ({compressionResult.compressionRatio.toFixed(1)}x smaller)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Media Upload Options */}
        {!selectedMedia && (
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <button 
                  onClick={() => handleMediaSelect('gallery')}
                  className="flex flex-col items-center p-6 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <PhotoIcon className="w-10 h-10 text-green-400 mb-3" />
                  <span className="text-sm font-medium text-white">Gallery</span>
                  <span className="text-xs text-gray-400 mt-1">Choose from library</span>
                </button>
              </div>
              <p className="text-gray-400 text-sm">Add photos to your post</p>
              <p className="text-gray-500 text-xs mt-1">
                Choose images from your gallery - they will be automatically optimized (350KB - 800KB)
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input for gallery selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};