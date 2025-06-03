import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem' }}>
      <Link href="/">Home</Link>
      <Link href="/wholesaler">Wholesaler</Link>
      <Link href="/buyer">Buyer</Link>
    </nav>
  );
};

export default Navbar;
