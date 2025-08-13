import Link from 'next/link';
export default function Page() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MEAR — Frontend Starter</h1>
      <p className="mb-4">This scaffold includes Zod, React Hook Form, Zustand, Tailwind + Shadcn ui tokens and basic form shell for rapid development.</p>
      <ul className="list-disc pl-5">
        <li><Link href='/form' className='text-sky-600 underline'>Open Form Shell</Link></li>
      </ul>
    </div>
  );
}
