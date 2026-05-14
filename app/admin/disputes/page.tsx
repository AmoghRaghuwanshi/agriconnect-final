import { redirect } from 'next/navigation';

/**
 * /admin/disputes → redirect to /admin/support
 * Disputes are now managed at /admin/support
 */
export default function AdminDisputesRedirect() {
  redirect('/admin/support');
}
