'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormShell from '../../components/FormShell';

export default function FormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hospitalNo, setHospitalNo] = useState<string | undefined>();

  useEffect(() => {
    // Check if user is authenticated
    const auth = localStorage.getItem('medical_auth');
    if (!auth) {
      router.push('/login');
      return;
    }

    // Check if session is still valid (optional: 24 hour timeout)
    try {
      const authData = JSON.parse(auth);
      const sessionAge = Date.now() - authData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        localStorage.removeItem('medical_auth');
        router.push('/login');
        return;
      }
    } catch (error) {
      localStorage.removeItem('medical_auth');
      router.push('/login');
      return;
    }

    // Get hospital number or draft ID from URL params if present
    const hospitalNoParam = searchParams.get('hospitalNo');
    const draftIdParam = searchParams.get('draftId');
    if (hospitalNoParam) {
      setHospitalNo(hospitalNoParam);
    }
    // draftId is handled in FormShell
  }, [router, searchParams]);

  const draftIdParam = searchParams.get('draftId');
  const draftId = draftIdParam ? (isNaN(Number(draftIdParam)) ? undefined : Number(draftIdParam)) : undefined;

  return (
    <div className="">
      <FormShell hospitalNo={hospitalNo} draftId={draftId} />
    </div>
  );
}
