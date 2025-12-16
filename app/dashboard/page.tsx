'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  ClockIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { MEARPDFGenerator } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

interface Draft {
  id?: number;
  userId: number;
  hospitalNo: string;
  currentPhase: string;
  updatedAt: string;
  form: any;
}

interface Case {
  id: number;
  form: any;
  created_at: string;
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update timer every 30 seconds for real-time elapsed time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds for better UX

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const token = auth?.token as string | undefined;

      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch completed cases and drafts in parallel
      const [casesRes, draftsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/mear?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_BASE_URL}/api/drafts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (!casesRes.ok || !draftsRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const casesData = await casesRes.json();
      const draftsData = await draftsRes.json();

      setCases(casesData);
      setDrafts(draftsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatElapsedTime = (updatedAt: string) => {
    const updated = new Date(updatedAt);
    const diffMs = currentTime.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    } else if (diffMins > 0) {
      return `${diffMins}m`;
    } else {
      return 'Just now';
    }
  };

  const getHospitalNo = (form: any): string => {
    return form?.demographics?.hospitalNo || 'N/A';
  };

  const handleStartNewCollection = async () => {
    // Create a new draft when starting a new collection
    try {
      const authRaw = typeof window !== 'undefined' ? localStorage.getItem('medical_auth') : null;
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const token = auth?.token as string | undefined;

      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/draft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            form: {},
            currentPhase: 'demographics'
          })
        });

        if (res.ok) {
          const result = await res.json();
          router.push(`/form?draftId=${result.id}`);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to create new draft', err);
    }
    
    // Fallback: just navigate to form page
    router.push('/form');
  };

  const handleContinueDraft = (draft: Draft) => {
    if (draft.id) {
      router.push(`/form?draftId=${draft.id}`);
    } else {
      // Fallback to hospital number if draft ID not available
      router.push(`/form?hospitalNo=${encodeURIComponent(draft.hospitalNo)}`);
    }
  };

  const handleViewCase = (caseId: number) => {
    router.push(`/case/${caseId}`);
  };

  const handleDownloadPDF = async (caseItem: Case) => {
    try {
      const pdfGenerator = new MEARPDFGenerator();
      
      // Calculate values from form data (simplified - we can import the calculation functions if needed)
      const calculateValues = (formData: any) => {
        const calculated: any = {};
        
        // BMI
        if (formData.demographics?.weight && formData.demographics?.height) {
          const weight = parseFloat(formData.demographics.weight);
          const height = parseFloat(formData.demographics.height) / 100; // Convert to meters
          if (!isNaN(weight) && !isNaN(height) && height > 0) {
            calculated.bmi = weight / (height * height);
          }
        }
        
        // GCS
        if (formData.gcs) {
          const eye = parseInt(formData.gcs.eyeResponse) || 0;
          const verbal = formData.gcs.verbalResponse === null ? 1 : (parseInt(formData.gcs.verbalResponse) || 0);
          const motor = parseInt(formData.gcs.motorResponse) || 0;
          calculated.totalGCS = eye + verbal + motor;
        }
        
        return calculated;
      };
      
      const calculatedValues = calculateValues(caseItem.form);
      
      // Generate alerts (simplified - can import generateClinicalAlerts if needed)
      const alerts: any[] = [];
      
      const pdfData = {
        demographics: caseItem.form.demographics,
        vitals: caseItem.form.preInductionVitals,
        gcs: caseItem.form.gcs,
        indication: caseItem.form.indication,
        comorbidities: caseItem.form.comorbidities,
        leonScore: caseItem.form.leonScore,
        preInductionLabs: caseItem.form.preInductionLabs,
        airwayStatus: caseItem.form.airwayStatus,
        preIntubationManagement: caseItem.form.preIntubationManagement,
        postIntubationGcs: caseItem.form.postIntubationGcs,
        ventilatorSettings: caseItem.form.ventilatorSettings,
        postIntubationEvents: caseItem.form.postIntubationEvents,
        intubationAttempts: caseItem.form.intubationAttempts,
        calculatedValues,
        alerts,
        timestamp: new Date(caseItem.created_at)
      };

      await pdfGenerator.generatePDF(pdfData, {
        includeAlerts: true,
        includeCalculations: true,
        includeTimestamp: true
      });

      const hospitalNo = getHospitalNo(caseItem.form);
      const timestamp = new Date(caseItem.created_at).toISOString().slice(0, 16).replace('T', '_');
      const filename = `MEAR_Report_Case${caseItem.id}_${hospitalNo}_${timestamp}.pdf`;
      await pdfGenerator.downloadPDF(filename);

      toast.success('PDF report downloaded successfully!', { duration: 3000 });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF report', { duration: 3000 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalCases = cases.length;
  const totalDrafts = drafts.length;
  const recentCases = cases.filter(c => {
    const caseDate = new Date(c.created_at);
    const daysDiff = (currentTime.getTime() - caseDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Modern Header with Light Blue */}
      <div className="bg-blue-100 border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-gray-900">
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-700 text-lg">Medical Emergency Assessment Records</p>
            </div>
            <button
              onClick={handleStartNewCollection}
              className="group flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
            >
              <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Start New Collection
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md animate-slide-down">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Cases</p>
                <p className="text-3xl font-bold text-gray-900">{totalCases}</p>
              </div>
              <div className="bg-blue-100 rounded-xl p-4">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              <span>All completed records</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Ongoing Drafts</p>
                <p className="text-3xl font-bold text-gray-900">{totalDrafts}</p>
              </div>
              <div className="bg-amber-100 rounded-xl p-4">
                <ClockIcon className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              <span>In progress</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Recent Cases</p>
                <p className="text-3xl font-bold text-gray-900">{recentCases}</p>
              </div>
              <div className="bg-green-100 rounded-xl p-4">
                <CalendarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>Last 7 days</span>
            </div>
          </div>
        </div>

        {/* Ongoing Data Collection Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ongoing Data Collection</h2>
            {drafts.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
              </span>
            )}
          </div>
          {drafts.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">No ongoing data collection</p>
              <p className="text-gray-500 text-sm">Start a new collection to begin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map((draft, index) => (
                <div
                  key={draft.userId}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
                  onClick={() => handleContinueDraft(draft)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Light blue accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-300"></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 rounded-lg p-2 mr-3">
                          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hospital ID</p>
                          <span className="text-base font-bold text-gray-900">
                            {draft.hospitalNo}
                          </span>
                        </div>
                      </div>
                      <div className="ml-11">
                        <p className="text-xs text-gray-500 mb-1">Current Phase</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 capitalize">
                          {draft.currentPhase}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                      <span className="font-medium">{formatElapsedTime(draft.updatedAt)} ago</span>
                    </div>
                    <button
                      className="group/btn flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueDraft(draft);
                      }}
                    >
                      Continue
                      <ArrowRightIcon className="h-4 w-4 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Cases */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Completed Cases</h2>
            {cases.length > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {cases.length} {cases.length === 1 ? 'case' : 'cases'}
              </span>
            )}
          </div>
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center shadow-sm">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">No completed cases yet</p>
              <p className="text-gray-500 text-sm">Completed cases will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Case ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Hospital ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cases.map((caseItem, index) => (
                      <tr 
                        key={caseItem.id} 
                        className="hover:bg-blue-50 transition-all duration-200"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800">
                            #{caseItem.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {getHospitalNo(caseItem.form)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{new Date(caseItem.created_at).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewCase(caseItem.id)}
                              className="group flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <EyeIcon className="h-4 w-4 mr-1.5" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPDF(caseItem);
                              }}
                              className="group flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 mr-1.5 group-hover:animate-bounce" />
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

