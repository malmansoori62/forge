'use client';
import { Dumbbell } from 'lucide-react';
import { useState } from 'react';

export default function ExerciseImage({
  src, alt, className = '', round = false
}: {
  src?: string; alt: string; className?: string; round?: boolean;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`${className} ${round ? 'rounded-full' : 'rounded-xl'} bg-forge-stone flex items-center justify-center`}>
        <Dumbbell className="w-1/3 h-1/3 text-forge-ash" />
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt}
      onError={() => setErr(true)}
      className={`${className} ${round ? 'rounded-full' : 'rounded-xl'} object-cover bg-forge-stone`}
    />
  );
}
