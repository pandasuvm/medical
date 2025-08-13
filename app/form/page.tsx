'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormShell from '../../components/FormShell';

export default function FormPage() {
  const router = useRouter();

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
  }, [router]);

  return (
    <div className="">
      <FormShell />
    </div>
  );
}
