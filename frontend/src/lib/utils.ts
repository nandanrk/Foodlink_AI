import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'status-completed';
    case 'pending': case 'notified': return 'status-pending';
    case 'expired': return 'status-expired';
    case 'accepted': case 'volunteer_assigned': case 'picked_up': return 'status-accepted';
    case 'processing': return 'status-processing';
    default: return 'status-pending';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'processing': return 'Processing';
    case 'pending': return 'Pending';
    case 'notified': return 'NGO Notified';
    case 'accepted': return 'Accepted';
    case 'volunteer_assigned': return 'Volunteer Assigned';
    case 'picked_up': return 'Picked Up';
    case 'completed': return 'Delivered';
    case 'expired': return 'Expired';
    default: return status;
  }
}
