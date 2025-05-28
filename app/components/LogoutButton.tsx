'use client';

import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
    });

    router.push('/sign-in'); // or router.refresh() if you want to stay on the same page
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;