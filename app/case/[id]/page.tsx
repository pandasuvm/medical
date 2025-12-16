'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Case {
  id: number;
  form: any;
  created_at: string;
}

// Map of section keys to icons and colors
const sectionConfig: Record<string, { icon: React.ComponentType<any>, color: string, bgColor: string }> = {
  demographics: { icon: UserIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  comorbidities: { icon: HeartIcon, color: 'text-red-600', bgColor: 'bg-red-50' },
  gcs: { icon: ClipboardDocumentListIcon, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  indication: { icon: ShieldCheckIcon, color: 'text-green-600', bgColor: 'bg-green-50' },
  leonScore: { icon: ChartBarIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  preInductionVitals: { icon: HeartIcon, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  preInductionLabs: { icon: BeakerIcon, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  airwayStatus: { icon: ShieldCheckIcon, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  preIntubationManagement: { icon: ClipboardDocumentListIcon, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  postIntubationGcs: { icon: ClipboardDocumentListIcon, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ventilatorSettings: { icon: HeartIcon, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  postIntubationEvents: { icon: CheckCircleIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  intubationAttempts: { icon: ClipboardDocumentListIcon, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  monitoringTable: { icon: ChartBarIcon, color: 'text-sky-600', bgColor: 'bg-sky-50' }
};

export default function CaseViewPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params?.id as string;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const token = auth?.token as string | undefined;

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/mear/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load case data');
      }

      const data = await response.json();
      setCaseData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load case data');
      console.error('Case load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return value.map(v => formatValue(v)).join(', ');
    }
    if (typeof value === 'object') {
      if (Object.keys(value).length === 0) return 'N/A';
      return '';
    }
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const renderField = (label: string, value: any, level: number = 0): React.ReactNode => {
    if (value === null || value === undefined || value === '') return null;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      const entries = Object.entries(value);
      if (entries.length === 0) return null;
      
      const nonEmptyEntries = entries.filter(([_, val]) => {
        if (val === null || val === undefined || val === '') return false;
        if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      });
      
      if (nonEmptyEntries.length === 0) return null;
      
      if (level === 0) {
        // Top level - render as card sections
        const config = sectionConfig[label] || { icon: ClipboardDocumentListIcon, color: 'text-gray-600', bgColor: 'bg-gray-50' };
        const Icon = config.icon;
        
        return (
          <div key={label} className="mb-6">
            <div className={`${config.bgColor} rounded-t-lg px-4 py-3 border-b border-gray-200`}>
              <div className="flex items-center space-x-2">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <h3 className="font-semibold text-lg text-gray-800">
                  {formatKey(label)}
                </h3>
              </div>
            </div>
            <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nonEmptyEntries.map(([key, val]) => 
                  renderField(key, val, level + 1)
                )}
              </div>
            </div>
          </div>
        );
      }
      
      // Nested objects
      return (
        <div key={label} className={level > 0 ? 'ml-2 mt-2' : ''}>
          {level > 0 && (
            <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">
              {formatKey(label)}
            </h4>
          )}
          <div className="space-y-2">
            {nonEmptyEntries.map(([key, val]) => 
              renderField(key, val, level + 1)
            )}
          </div>
        </div>
      );
    }
    
    const formatted = formatValue(value);
    if (!formatted || formatted === 'N/A') return null;
    
    return (
      <div key={label} className={`${level > 0 ? 'ml-2' : ''} py-1.5`}>
        <div className="flex flex-col sm:flex-row sm:items-start">
          <span className="font-medium text-sm text-gray-600 min-w-[140px] mb-1 sm:mb-0">
            {formatKey(label)}:
          </span>
          <span className="text-sm text-gray-900 font-normal break-words">
            {formatted}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading case data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-6 text-lg">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  const form = caseData.form || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Case #{caseData.id}</h1>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(caseData.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(caseData.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {Object.entries(form).map(([key, value]) => 
            renderField(key, value, 0)
          )}
          
          {Object.keys(form).length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No case data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
