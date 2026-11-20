import { useState, useEffect } from 'react';
import api from '../api/apiClient';

export function useAdminCounters() {
  const [counters, setCounters] = useState({
    unreadMessages: 0,
    openTasks: 0,
    newLeads: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCounters = async () => {
      try {
        const [leadsRes, projRes, actRes] = await Promise.allSettled([
          api.get('/leads?limit=50'),
          api.get('/projects?limit=50'),
          api.get('/dashboard/activity')
        ]);

        let newLeadsCount = 0;
        let pendingApprovalsCount = 0;
        let unreadCount = 0;
        let openTasksCount = 0;

        if (leadsRes.status === 'fulfilled' && leadsRes.value?.success) {
          const leads = leadsRes.value.data?.items || leadsRes.value.data || [];
          newLeadsCount = leads.filter(l => l.workflowStep === 1 || l.status === 'Nieuw' || l.status === 'new').length;
          pendingApprovalsCount = leads.filter(l => l.workflowStep === 4 || l.workflowStep === 5).length;
        }

        if (projRes.status === 'fulfilled' && projRes.value?.success) {
          const projs = projRes.value.data?.items || projRes.value.data || [];
          projs.forEach(p => {
            if (p.unreadMessages || p.unreadCount) {
              unreadCount += Number(p.unreadMessages || p.unreadCount || 0);
            }
          });
        }

        // Also check localStorage for any direct messages
        const localUnread = parseInt(localStorage.getItem('va_admin_unread_messages') || '0', 10);
        const finalUnread = Math.max(unreadCount, localUnread);

        // Open tasks from localStorage or default
        const tasksRaw = localStorage.getItem('va_admin_tasks_v2');
        if (tasksRaw) {
          try {
            const parsed = JSON.parse(tasksRaw);
            if (Array.isArray(parsed)) {
              openTasksCount = parsed.filter(t => !t.completed && !t.isDone).length;
            }
          } catch (e) {}
        } else {
          openTasksCount = 2; // Default active tasks for Tim & Bram on Vandaag
        }

        if (isMounted) {
          setCounters({
            unreadMessages: finalUnread,
            openTasks: openTasksCount,
            newLeads: newLeadsCount,
            pendingApprovals: pendingApprovalsCount,
          });
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    fetchCounters();

    const handleSync = () => fetchCounters();
    window.addEventListener('app_data_changed', handleSync);
    window.addEventListener('storage', handleSync);
    const interval = setInterval(fetchCounters, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('app_data_changed', handleSync);
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, []);

  return counters;
}
