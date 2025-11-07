/**
 * EvidenceUpload Component
 * Handles photo, screenshot, and voice note uploads
 */

'use client';

import React, { useState, useRef } from 'react';
import type { EvidenceType } from '@momentum/shared';
import { cn, formatFileSize, isValidFileType, isValidFileSize } from '@/lib/utils';
import { uploadAPI } from '@/lib/api';
import { MAX_FILE_SIZES } from '@momentum/shared';
import Button from './Button';

interface EvidenceUploadProps {
  evidenceType: EvidenceType;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const ALLOWED_TYPES = {
  photo: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  screenshot: ['image/jpeg', 'image/png', 'image/webp'],
  voice: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/webm'],
  honor: [],
};

export default function EvidenceUpload({
  evidenceType,
  onUploadComplete,
  onError,
  className,
}: EvidenceUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Honor system doesn't require upload
  if (evidenceType === 'honor') {
    return (
      <div className={cn('text-center p-6 bg-gray-50 rounded-lg', className)}>
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-primary-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Honor System
        </h3>
        <p className="text-sm text-gray-600">
          We trust you completed this challenge. No evidence needed.
        </p>
      </div>
    );
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[evidenceType];
    if (!isValidFileType(file, allowedTypes)) {
      const errorMsg = `Invalid file type. Please upload a ${evidenceType === 'voice' ? 'audio' : 'image'} file.`;
      onError?.(errorMsg);
      return;
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[evidenceType.toUpperCase() as keyof typeof MAX_FILE_SIZES];
    if (!isValidFileSize(file, maxSize)) {
      const errorMsg = `File too large. Maximum size is ${formatFileSize(maxSize)}.`;
      onError?.(errorMsg);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (evidenceType === 'photo' || evidenceType === 'screenshot') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const url = await uploadAPI.uploadEvidence(
        selectedFile,
        evidenceType as 'photo' | 'screenshot' | 'voice'
      );
      onUploadComplete(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIcon = () => {
    switch (evidenceType) {
      case 'photo':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'screenshot':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'voice':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!selectedFile ? (
        <label
          htmlFor="evidence-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
            {getIcon()}
            <p className="mb-2 text-sm font-medium">
              Click to upload {evidenceType === 'voice' ? 'voice note' : evidenceType}
            </p>
            <p className="text-xs text-gray-400">
              {evidenceType === 'voice'
                ? 'MP3, WAV, M4A (Max 5MB)'
                : 'JPG, PNG, WEBP (Max 10MB)'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="evidence-upload"
            type="file"
            className="hidden"
            accept={ALLOWED_TYPES[evidenceType].join(',')}
            onChange={handleFileSelect}
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          {preview && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-primary-900">{getIcon()}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            isLoading={isUploading}
            fullWidth
            variant="primary"
          >
            {isUploading ? 'Uploading...' : 'Upload Evidence'}
          </Button>
        </div>
      )}
    </div>
  );
}
