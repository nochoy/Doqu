import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border p-4 px-8 border-b fixed w-full">
      <nav className="flex justify-between mx-auto">
        <div>Logo</div>
        <div className="flex items-center gap-4 ">
          <span>Host</span>
          <span>Join</span>
          <span>Create</span>
          <span>Profile</span>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
