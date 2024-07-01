import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-gray-800">
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
            <Link className="flex flex-shrink-0 gap-2" href="/">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500&width=500"
                alt="Your Company"
              />
              <h1 className="text-white text-2xl">Video Touch</h1>
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
                <Link className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                      href={'login'}>Login</Link>
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
