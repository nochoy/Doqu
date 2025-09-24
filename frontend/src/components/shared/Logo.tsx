import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href='/'>
      <Image
        src='/DoquLogo1.svg'
        alt='Doqu logo'
        width={60}
        height={120}
        className='h-8 sm:h-10 w-auto'
      />
    </Link>
  )
}