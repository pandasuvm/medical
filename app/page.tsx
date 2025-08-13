'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartIcon, ShieldCheckIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('medical_auth');
    if (!auth) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MEAR</h1>
              <p className="text-gray-600">Medical Emergency Assessment & Reporting</p>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to MEAR</h2>
          <p className="text-gray-600 mb-6">
            Comprehensive medical assessment platform designed for emergency and clinical scenarios. 
            This system includes advanced form validation, clinical calculations, and professional reporting capabilities.
          </p>

          {/* Quick Access */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href='/form' 
              className="group bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-6 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <DocumentCheckIcon className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Start Assessment</h3>
                  <p className="text-sm text-blue-700">Begin new medical assessment form</p>
                </div>
              </div>
            </Link>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-8 w-8 text-gray-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Secure Platform</h3>
                  <p className="text-sm text-gray-600">HIPAA compliant data handling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-Phase Assessment</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Demographics & Patient Info</li>
              <li>• Vital Signs Monitoring</li>
              <li>• Glasgow Coma Scale</li>
              <li>• Clinical Scoring Systems</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Intelligence</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Automated Risk Calculations</li>
              <li>• Clinical Alert System</li>
              <li>• Evidence-based Protocols</li>
              <li>• Real-time Validation</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Reporting</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Comprehensive PDF Reports</li>
              <li>• Clinical Summaries</li>
              <li>• Standardized Documentation</li>
              <li>• Audit Trail Support</li>
            </ul>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('medical_auth');
              router.push('/login');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
