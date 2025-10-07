import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className="flex items-center mb-0">
      <Image
        src="/DoquLogo1.svg"
        alt="Doqu logo"
        width={60}
        height={120}
        className={cn('h-10 w-auto', className)}
      />
    </Link>
  );
}
