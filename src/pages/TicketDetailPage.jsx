import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/layout/AppLayout';
import SlaBadge from '../components/tickets/SlaBadge';
import TicketStatusBadge from '../components/tickets/TicketStatusBadge';
import { fetchTicket, updateTicket, updateTicketStatus, assignTicket } from '../api/tickets';
import { fetchComments, createComment } from '../api/comments';
import { fetchAgents } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { TICKET_PRIORITIES, TICKET_STATUSES, priorityLabel, slaClass } from '../utils/constants';
import {
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
  labelClass,
  mutedTextClass,
  pageTitleClass,
  selectClass,
} from '../utils/ui';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { isAgent } = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['tickets', id],
    queryFn: () => fetchTicket(id),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['tickets', id, 'comments'],
    queryFn: () => fetchComments(id),
    enabled: Boolean(ticket),
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    enabled: isAgent,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tickets', id] });
    queryClient.invalidateQueries({ queryKey: ['tickets', id, 'comments'] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
  };

  const commentMutation = useMutation({
    mutationFn: (payload) => createComment(id, payload),
    onSuccess: () => {
      setCommentBody('');
      setIsInternal(false);
      invalidate();
    },
  });

  const priorityMutation = useMutation({
    mutationFn: (value) => updateTicket(id, {
      subject: ticket.subject,
      description: ticket.description,
      priority: value,
    }),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: (value) => updateTicketStatus(id, value),
    onSuccess: invalidate,
  });

  const assignMutation = useMutation({
    mutationFn: (value) => assignTicket(id, value ? Number(value) : null),
    onSuccess: invalidate,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <p className={mutedTextClass}>Loading ticket...</p>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <p className={mutedTextClass}>Ticket not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className={`${pageTitleClass} break-words`}>{ticket.subject}</h1>
          <p className={`mt-1 ${mutedTextClass}`}>Ticket #{ticket.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TicketStatusBadge status={ticket.status} />
          <SlaBadge status={ticket.sla_status} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <section className={cardClass}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Details</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Priority', priorityLabel(ticket.priority)],
              ['SLA Deadline', new Date(ticket.sla_deadline_at).toLocaleString()],
              ['Organization', ticket.organization?.name],
              ['Created By', ticket.creator?.name],
              ['Assignee', ticket.assignee?.name ?? 'Unassigned'],
            ].map(([term, value]) => (
              <div key={term} className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr] sm:gap-3">
                <dt className="font-medium text-slate-500">{term}</dt>
                <dd className="text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {ticket.description}
          </p>
        </section>

        {isAgent && (
          <section className={cardClass}>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Agent Actions</h2>
            <div className="space-y-4">
              <label className={labelClass}>
                Update Priority
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <select
                    className={`${selectClass} sm:flex-1`}
                    value={priority || ticket.priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {TICKET_PRIORITIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={`${btnSecondary} w-full sm:w-auto`}
                    onClick={() => priorityMutation.mutate(priority || ticket.priority)}
                  >
                    Save
                  </button>
                </div>
              </label>

              <label className={labelClass}>
                Update Status
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <select
                    className={`${selectClass} sm:flex-1`}
                    value={status || ticket.status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {TICKET_STATUSES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={`${btnSecondary} w-full sm:w-auto`}
                    onClick={() => statusMutation.mutate(status || ticket.status)}
                  >
                    Update
                  </button>
                </div>
              </label>

              <label className={labelClass}>
                Assign Agent
                <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                  <select
                    className={`${selectClass} sm:flex-1`}
                    value={assignedTo || ticket.assigned_to || ''}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={`${btnSecondary} w-full sm:w-auto`}
                    onClick={() => assignMutation.mutate(assignedTo || ticket.assigned_to || '')}
                  >
                    Assign
                  </button>
                </div>
              </label>
            </div>
          </section>
        )}
      </div>

      <section className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Comments</h2>

        <div className="mb-6 space-y-3">
          {comments.length === 0 ? (
            <p className={mutedTextClass}>No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.id}
                className={`rounded-lg border p-4 ${
                  comment.is_internal
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <header className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                  <strong className="text-slate-900">{comment.author?.name}</strong>
                  <span className="text-slate-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {comment.is_internal && (
                    <span className={slaClass('due_soon')}>Internal</span>
                  )}
                </header>
                <p className="text-sm leading-relaxed text-slate-700">{comment.body}</p>
              </article>
            ))
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            commentMutation.mutate({
              body: commentBody,
              ...(isAgent ? { is_internal: isInternal } : {}),
            });
          }}
        >
          <label className={labelClass}>
            Add Comment
            <textarea
              rows={4}
              className={inputClass}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              required
            />
          </label>

          {isAgent && (
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              Internal note (not visible to client)
            </label>
          )}

          <button
            type="submit"
            className={`${btnPrimary} mt-4 w-full sm:w-auto`}
            disabled={commentMutation.isPending}
          >
            {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </section>
    </AppLayout>
  );
}
