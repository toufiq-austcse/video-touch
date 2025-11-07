import Link from "next/link";
import { useAuthContext } from "@/contexts/useAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { currentUser } = useAuthContext();

  const onLogOutClick = () => {
    localStorage.clear();
    location.reload();
  };
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full px-5 sm:px-6 lg:px-20">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/*<button type="button"*/}
            {/*        className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"*/}
            {/*        aria-controls="mobile-menu" aria-expanded="false">*/}
            {/*  <span className="absolute -inset-0.5"></span>*/}
            {/*  <span className="sr-only">Open main menu</span>*/}
            {/*  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"*/}
            {/*       aria-hidden="true">*/}
            {/*    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />*/}
            {/*  </svg>*/}

            {/*  <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"*/}
            {/*       aria-hidden="true">*/}
            {/*    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />*/}
            {/*  </svg>*/}
            {/*</button>*/}
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link className="flex flex-shrink-0 items-center gap-2" href="/">
              <svg
                className="h-8 w-auto text-indigo-500"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 8H2V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H8V4H4V8Z" />
                <path d="M20 8H22V4C22 3.46957 21.7893 2.96086 21.4142 2.58579C21.0391 2.21071 20.5304 2 20 2H16V4H20V8Z" />
                <path d="M20 20H16V22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V16H20V20Z" />
                <path d="M4 20H8V22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V16H4V20Z" />
                <path d="M9 7L15 12L9 17V7Z" />
              </svg>
              <h1 className="text-indigo-500 text-2xl font-bold">VDIO Touch</h1>
            </Link>
            {/*<div className="hidden sm:ml-6 sm:block">*/}
            {/*  <div className="flex space-x-4">*/}
            {/*    <a href="#" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"*/}
            {/*       aria-current="page">Dashboard</a>*/}
            {/*    <a href="#"*/}
            {/*       className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>*/}
            {/*    <a href="#"*/}
            {/*       className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>*/}
            {/*    <a href="#"*/}
            {/*       className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/*<button type="button"*/}
            {/*        className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">*/}
            {/*  <span className="absolute -inset-1.5"></span>*/}
            {/*  <span className="sr-only">View notifications</span>*/}
            {/*  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"*/}
            {/*       aria-hidden="true">*/}
            {/*    <path stroke-linecap="round" stroke-linejoin="round"*/}
            {/*          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />*/}
            {/*  </svg>*/}
            {/*</button>*/}

            <div className="relative ml-3 ">
              <div>
                {currentUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <h1 className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 underline hover:cursor-pointer">
                        {currentUser.name}
                      </h1>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span onClick={onLogOutClick}>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                    href={"/login"}
                  >
                    Login
                  </Link>
                )}
              </div>

              {/*<div*/}
              {/*  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"*/}
              {/*  role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">*/}

              {/*  <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1"*/}
              {/*     id="user-menu-item-0">Your Profile</a>*/}
              {/*  <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1"*/}
              {/*     id="user-menu-item-1">Settings</a>*/}
              {/*  <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1"*/}
              {/*     id="user-menu-item-2">Sign out</a>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>

      {/*<div className="sm:hidden" id="mobile-menu">*/}
      {/*  <div className="space-y-1 px-2 pb-3 pt-2">*/}
      {/*    <a href="#" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"*/}
      {/*       aria-current="page">Dashboard</a>*/}
      {/*    <a href="#"*/}
      {/*       className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>*/}
      {/*    <a href="#"*/}
      {/*       className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>*/}
      {/*    <a href="#"*/}
      {/*       className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </nav>
  );
};
export default Navbar;
