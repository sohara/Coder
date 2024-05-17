"use client";

import type { User } from "next-auth";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { LoginButton } from "./auth-buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

export function UserDropdown({ user }: { user?: User }) {
  return <div>{user ? <AccountMenu user={user} /> : <LoginButton />}</div>;
}

function AccountMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-full gap-2 px-2 bg-white bg-opacity-0 lg:px-4 hover:bg-white hover:bg-opacity-5 w-[175px]"
        >
          <Image
            className="rounded-full"
            src={user.image ?? ""}
            alt="user avatar"
            height={26}
            width={26}
          />
          <p className="truncate">{user.name}</p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-red-500 hover:text-white focus:bg-destructive hover:cursor-pointer"
          onClick={() => signOut({ callbackUrl: `${window.location.origin}` })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
