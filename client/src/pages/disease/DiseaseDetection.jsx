import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { diseaseService } from '../../services/diseaseService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import {
  ScanSearch,
  UploadCloud,
  Image as ImageIcon,
  X,
  AlertCircle,
  HelpCircle,
  Camera,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const DiseaseDetection = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropName, setCropName] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  
  const [fileError, setFileError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (file) => {
    setFileError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Invalid image format. Please upload JPEG, PNG, or WebP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError('File exceeds 8MB maximum upload limit.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select or upload a plant photo before proceeding.');
      return;
    }

    try {
      setAnalyzing(true);
      setFileError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);
      if (cropName) formData.append('crop_name', cropName);
      if (growthStage) formData.append('growth_stage', growthStage);
      if (symptoms) formData.append('symptoms', symptoms);
      if (duration) formData.append('duration_of_symptoms', duration);
      if (profile?.district) formData.append('location', `${profile.district}, ${profile.state}`);

      const result = await diseaseService.analyzeDisease(formData);
      navigate(`/disease-detection/results/${result.id}`, { state: { result } });
    } catch (err) {
      setFileError(err.message || 'Plant disease analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <PageContainer>
        <div className="bg-white p-12 rounded-3xl border border-surface-border text-center max-w-xl mx-auto shadow-sm my-12">
          <LoadingState message="Gemini Multimodal Vision is examining plant foliage, lesions, discoloration patterns, and diagnostic markers..." />
          <p className="mt-4 text-xs text-text-muted">
            Matching symptoms against fungal, bacterial, viral, and nutrient pathology models...
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Plant Disease Diagnosis & Health Scan"
        subtitle="Upload leaf, stem, or fruit photos to detect fungal, bacterial, viral infections, or nutrient stress with Gemini Multimodal Vision"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Computer Vision Analysis
          </span>
        }
      />

      {fileError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 leading-relaxed">
            <p className="font-bold">Image Validation Error</p>
            <p>{fileError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Upload Area (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs">
              <h2 className="text-sm font-bold text-text-main mb-2">1. Upload Plant Photo</h2>
              <p className="text-xs text-text-muted mb-6">
                Take a clear, well-lit photo showing both affected and healthy leaf tissue if possible.
              </p>

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-surface-border bg-slate-900 flex items-center justify-center max-h-[380px]">
                  <img
                    src={previewUrl}
                    alt="Uploaded plant specimen"
                    className="w-full h-full object-contain max-h-[380px]"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer shadow-md"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full">
                    {selectedFile?.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-surface-border hover:border-agri-600 rounded-3xl p-10 text-center cursor-pointer transition-colors bg-surface-bg/50 hover:bg-agri-50/30 flex flex-col items-center justify-center min-h-[300px]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white text-agri-700 flex items-center justify-center mb-4 shadow-sm border border-surface-border">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-text-main mb-1">
                    Drag & Drop Plant Image Here
                  </h3>
                  <p className="text-xs text-text-muted mb-4">
                    Supports JPEG, PNG, or WebP up to 8 MB
                  </p>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-surface-border text-agri-800 shadow-xs hover:bg-surface-hover">
                    <Camera className="w-4 h-4" />
                    Browse Photo
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
            </div>
          </div>

          {/* Right Column: Context Information (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-text-main pb-3 border-b border-surface-border">
                2. Plant Context (Optional but Recommended)
              </h2>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Crop / Plant Name
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Tomato, Soybean, Cotton, Wheat"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Plant Growth Stage
                </label>
                <select
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none bg-white"
                >
                  <option value="">Select Growth Stage (Optional)</option>
                  <option value="Seedling / Germination">Seedling / Germination</option>
                  <option value="Vegetative Growth">Vegetative Growth</option>
                  <option value="Flowering / Budding">Flowering / Budding</option>
                  <option value="Fruit / Pod Development">Fruit / Pod Development</option>
                  <option value="Maturity / Ripening">Maturity / Ripening</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Observed Symptoms
                </label>
                <textarea
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Yellowing margins, brown circular spots with halo, wilting leaves"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1.5">
                  Duration of Symptoms
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. Appeared 3 days ago after rain"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-2 focus:ring-agri-600/20 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 shadow-md shadow-agri-700/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <ScanSearch className="w-4 h-4" />
                Analyze Plant Health with Gemini Vision
              </button>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
};
