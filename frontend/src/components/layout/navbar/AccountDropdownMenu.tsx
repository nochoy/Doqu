"use client"

import React from 'react';
import Link from 'next/link';
import { CaretDownIcon, GearIcon, SignInIcon, SignOutIcon, UserCircleIcon, UserIcon, UserPlusIcon } from '@phosphor-icons/react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AccountDropdownMenu() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const router = useRouter()

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <DropdownMenu>
    {/* Profile Dropdown Button*/}
    <DropdownMenuTrigger className='flex items-center cursor-pointer p-1 h-9 w-auto gap-0.5'>
        {isAuthenticated ? <UserCircleIcon size={28} weight='fill'/> : <UserCircleIcon size={28}/>}
        <CaretDownIcon weight='bold'/>
    </DropdownMenuTrigger>

    {/* Popup */}
    <DropdownMenuContent align='end' className='w-[12rem]'>
      {/* Username & Email */}
      <DropdownMenuLabel>
        { isAuthenticated ?
          <p className='truncate'>
            { currentUser?.username }
          </p> :
          <p className='justify-self-center'>
            Not signed in
          </p>
        }
        <p className='text-muted-foreground text-sm font-normal truncate'>
          { currentUser?.email }
        </p>
      </DropdownMenuLabel>
      <DropdownMenuGroup>
        { isAuthenticated &&
          <>
            <DropdownMenuSeparator/>
            <DropdownMenuItem asChild>
              <Link href={`/profile/${currentUser?.id}`}>
                <UserIcon/>
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings'>
                  <GearIcon/>
                  Settings
              </Link>
            </DropdownMenuItem>
          </>
        }
        {/* Login/Logout button */}
          { isAuthenticated ?
            <DropdownMenuItem onClick={handleLogout} className='flex items-center gap-2'>
                <SignOutIcon size={16}/>Logout 
            </DropdownMenuItem> : 
            <DropdownMenuItem asChild>
              <Link href='/login'>
                  <SignInIcon size={16}/>Login 
              </Link>
            </DropdownMenuItem>
          }
        {/* Register button */}
        { !isAuthenticated && 
          <DropdownMenuItem asChild>
            <Link href='/register'>
              <UserPlusIcon size={16}/> Register
            </Link>
          </DropdownMenuItem>
        }
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
  )
}