import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, ShieldAlert, Sparkles, RefreshCw, Loader2, Check, AlertCircle } from 'lucide-react';
import { SkincareAnalysis } from '../types';

interface PhotoAnalysisFlowProps {
  onBack: () => void;
  onAnalysisComplete: (result: SkincareAnalysis) => void;
}

export const PhotoAnalysisFlow: React.FC<PhotoAnalysisFlowProps> = ({
  onBack,
  onAnalysisComplete,
}) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  const [useCameraMode, setUseCameraMode] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    setUseCameraMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or upload an existing photo.');
      setUseCameraMode(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setUseCameraMode(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze photo.');
      }

      const data = await response.json();

      const newAnalysis: SkincareAnalysis = {
        id: 'analysis_photo_' + Date.now(),
        timestamp: Date.now(),
        mode: 'photo',
        skin_type: data.skin_type || 'Combination',
        top_concerns: data.top_concerns || ['Surface Texture & Texture'],
        morning_routine: data.morning_routine || [],
        night_routine: data.night_routine || [],
        ingredients_to_look_for: data.ingredients_to_look_for || [],
        ingredients_to_avoid: data.ingredients_to_avoid || [],
        disclaimer: data.disclaimer || 'General guidance based on visual cues, not a medical diagnosis.',
        photoPreview: selectedImage,
      };

      onAnalysisComplete(newAnalysis);
    } catch (err: any) {
      console.error('Error analyzing photo:', err);
      setErrorMessage(err.message || 'An error occurred during selfie scan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-12 space-y-6">
      {/* Back Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          id="photo-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-medium text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full">
          Photo Visual Scan
        </span>
      </div>

      {/* Mandatory Pre-Analysis Disclaimer Step */}
      {!disclaimerAccepted ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-serif font-semibold text-slate-800">
              Important Health & Medical Disclaimer
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed bg-rose-50/60 p-4 rounded-xl border border-rose-100/80">
              "This is general skincare guidance based on visual cues, not a medical diagnosis. For persistent, painful, or severe skin concerns (such as cystic acne, eczema, or rashes), please consult a qualified dermatologist."
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="accept-disclaimer-checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">
                I understand this analysis provides cosmetic & cosmetic ingredient guidance only and does not substitute medical care.
              </span>
            </label>

            <button
              onClick={() => setDisclaimerAccepted(true)}
              id="continue-photo-analysis-btn"
              disabled={!disclaimerAccepted}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Selfie Scan</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Photo Upload & Camera Workspace */
        <div className="bg-white rounded-2xl border border-rose-100/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-slate-800">
              Upload or Take a Selfie
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              For best results, use natural lighting with a clear, makeup-free view of your face.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {cameraError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {cameraError}
            </div>
          )}

          {/* Viewport Box */}
          <div className="relative aspect-4/3 w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-200 flex items-center justify-center">
            {/* Case A: Camera Stream Active */}
            {useCameraMode && (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Face Alignment Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-64 border-2 border-emerald-400/80 rounded-full border-dashed flex items-center justify-center">
                    <span className="text-[10px] text-emerald-300 font-semibold bg-slate-900/60 px-2 py-1 rounded-full">
                      Align Face Here
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Case B: Photo Captured / Uploaded */}
            {!useCameraMode && selectedImage && (
              <img
                src={selectedImage}
                alt="Selected selfie preview"
                className="w-full h-full object-contain bg-slate-950"
              />
            )}

            {/* Case C: No Image Selected Yet */}
            {!useCameraMode && !selectedImage && (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">No selfie chosen</p>
                  <p className="text-[11px] text-slate-400">Take a new photo or select one from your phone gallery</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons for Image Capture / Selection */}
          <div className="space-y-3">
            {useCameraMode ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={captureCameraPhoto}
                  id="capture-photo-btn"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  id="cancel-camera-btn"
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  id="use-webcam-btn"
                  className="py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  id="upload-file-btn"
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Submit / Analyze Action */}
            {selectedImage && !useCameraMode && (
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleAnalyzePhoto}
                  disabled={isLoading}
                  id="analyze-photo-submit-btn"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning Visual Surface Cues...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Selfie for Skincare Routine</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  id="retake-photo-btn"
                  className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Retake / Choose different photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
