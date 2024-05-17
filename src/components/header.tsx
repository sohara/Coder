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
        <ModeToggle />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
