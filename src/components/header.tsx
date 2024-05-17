import { getCurrentUser } from "@/lib/session";
import Link from "next/link";
import { CodeIcon } from "./icons/code-icon";
import { Button } from "./ui/button";
import { PlayIcon } from "./icons/play-icon";
import { ModeToggle } from "./mode-toggle";
import { UserDropdown } from "./user-dropdown";

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="flex h-16 items-center justify-between border-b bg-gray-100 px-6 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-4">
        <Link className="flex items-center gap-2 font-semibold" href="#">
          <CodeIcon className="h-6 w-6" />
          <span>Code Collab</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="ghost">
          <PlayIcon className="h-5 w-5" />
          <span className="sr-only">Run code</span>
        </Button>
        {/* <DropdownMenu> */}
        {/*   <DropdownMenuTrigger asChild> */}
        {/*     <Button size="icon" variant="ghost"> */}
        {/*       <ShareIcon className="h-5 w-5" /> */}
        {/*       <span className="sr-only">Share</span> */}
        {/*     </Button> */}
        {/*   </DropdownMenuTrigger> */}
        {/*   <DropdownMenuContent align="end"> */}
        {/*     <DropdownMenuItem>Copy link</DropdownMenuItem> */}
        {/*     <DropdownMenuItem>Invite collaborators</DropdownMenuItem> */}
        {/*   </DropdownMenuContent> */}
        {/* </DropdownMenu> */}
        {/* <DropdownMenu> */}
        {/*   <DropdownMenuTrigger asChild> */}
        {/*     <Button size="icon" variant="ghost"> */}
        {/*       <img */}
        {/*         alt="Avatar" */}
        {/*         className="rounded-full" */}
        {/*         height="32" */}
        {/*         src="/placeholder.svg" */}
        {/*         style={{ */}
        {/*           aspectRatio: "32/32", */}
        {/*           objectFit: "cover", */}
        {/*         }} */}
        {/*         width="32" */}
        {/*       /> */}
        {/*       <span className="sr-only">User menu</span> */}
        {/*     </Button> */}
        {/*   </DropdownMenuTrigger> */}
        {/*   <DropdownMenuContent align="end"> */}
        {/*     <DropdownMenuLabel>Jared Palmer</DropdownMenuLabel> */}
        {/*     <DropdownMenuSeparator /> */}
        {/*     <DropdownMenuItem>Settings</DropdownMenuItem> */}
        {/*     <DropdownMenuItem>Logout</DropdownMenuItem> */}
        {/*   </DropdownMenuContent> */}
        {/* </DropdownMenu> */}
        <ModeToggle />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
