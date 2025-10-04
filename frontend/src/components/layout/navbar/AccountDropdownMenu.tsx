"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CaretDownIcon, CaretUpDownIcon, GearIcon, SignInIcon, SignOutIcon, UserCircleIcon, UserIcon, UserPlusIcon } from '@phosphor-icons/react';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function AccountDropdownMenu() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const router = useRouter()
  const isMobile = useMediaQuery();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  return (
    <DropdownMenu>
      { isMobile ? (
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='py-6 px-2 rounded-xl'>
            {isAuthenticated ? <UserCircleIcon size={32} weight='fill'/> : <UserCircleIcon size={32} className='text-muted-foreground'/>}
            <div className='flex flex-col items-start'>
              { isAuthenticated ? (
                <>
                  <span className='truncate'>{currentUser?.username}</span>
                  <span className='text-muted-foreground text-xs font-normal truncate'>{currentUser?.email}</span>
                </>
              ) : (
                <p className='justify-self-center text-muted-foreground font-normal'>Not signed in</p>
              )
            }
            </div>
            <CaretUpDownIcon size={24} weight='light' className="ml-auto"/>
          </Button>
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger className='flex items-center cursor-pointer p-1 h-9 w-auto gap-0.5'>
            {isAuthenticated ? <UserCircleIcon size={28} weight='fill'/> : <UserCircleIcon size={28}/>}
            <CaretDownIcon weight='bold'/>
        </DropdownMenuTrigger>
      )}
      {/* Popup */}
      <DropdownMenuContent 
        align='end' 
        side={isMobile ? 'top' : 'bottom'} 
        className={isMobile ? 'w-[--radix-popper-anchor-width]' : 'w-[12rem]'}
      >
        {/* Username & Email */}
        <DropdownMenuLabel>
          { isAuthenticated ?
            <p className='truncate'>{ currentUser?.username }</p>
            :
            <p className='justify-self-center'>Not signed in</p>
          }
          <p className='text-muted-foreground text-sm font-normal truncate'>
            { currentUser?.email }
          </p>
        </DropdownMenuLabel>

        {/* Menu Options */}
        <DropdownMenuGroup>
          {/* Profile + Settings Links */}
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
              (
                <DropdownMenuItem onClick={handleLogout} className='flex items-center gap-2'>
                    <SignOutIcon size={16}/>Logout 
                </DropdownMenuItem> 
              ) : (
                <DropdownMenuItem asChild>
                  <Link href='/login'>
                      <SignInIcon size={16}/>Login 
                  </Link>
                </DropdownMenuItem>
              )
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