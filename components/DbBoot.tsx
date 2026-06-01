'use client';
import { useEffect } from 'react';
import { ensureSeeded } from '@/lib/db';

export default function DbBoot() {
  useEffect(() => {
    ensureSeeded().catch(err => console.error('[forge] seed error', err));
  }, []);
  return null;
}
