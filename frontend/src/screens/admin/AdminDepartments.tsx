import { useState } from 'react';
import { useIsMobile } from '../../lib/useIsMobile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { CanvasHead } from '../../components/layout/CanvasHead';
import { Btn } from '../../components/ui/Btn';
import { Field } from '../../components/ui/Field';
import { Building2, Plus, Pencil, Check, X } from 'lucide-react';

interface Department { _id: string; name: string; issueCount?: number; }

export function AdminDepartments() {
  const qc = useQueryClient();
  const isMobile = useIsMobile();
  const [newName, setNewName]       = useState('');
  const [editId, setEditId]         = useState<string | null>(null);
  const [editName, setEditName]     = useState('');

  const { data = [], isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => adminApi.listDepartments().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: () => adminApi.createDepartment(newName),
    onSuccess: () => { setNewName(''); qc.invalidateQueries({ queryKey: ['departments'] }); },
  });

  const updateMut = useMutation({
    mutationFn: () => adminApi.updateDepartment(editId!, editName),
    onSuccess: () => { setEditId(null); qc.invalidateQueries({ queryKey: ['departments'] }); },
  });

  return (
    <div style={{ padding: isMobile ? '16px 16px 80px' : 'clamp(24px, 4vw, 40px)' }}>
      <CanvasHead
        eyebrow="Admin · Departments"
        title={<>Municipal <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>departments</em></>}
        subtitle={`${data.length} departments configured`}
      />

      {/* Add new */}
      <div style={{
        background: 'var(--paper)', borderRadius: 'var(--radius-card)',
        padding: '22px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)',
        marginBottom: 20,
      }}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px' }}>
          Add department
        </h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field
              label=""
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Department name (e.g. Roads & Highways)"
              onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createMut.mutate(); }}
            />
          </div>
          <Btn
            variant="sunny" size="sm"
            onClick={() => newName.trim() && createMut.mutate()}
            disabled={!newName.trim() || createMut.isPending}
            style={{ alignSelf: 'flex-end', padding: '12px 20px' }}
          >
            <Plus size={14} />
            Add
          </Btn>
        </div>
      </div>

      {/* List */}
      <div style={{
        background: 'var(--paper)', borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)', border: '1px solid var(--line)', overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>
            Loading…
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '56px 22px', textAlign: 'center' }}>
            <Building2 size={32} style={{ color: 'var(--ink-3)', marginBottom: 12 }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--ink-3)', margin: 0 }}>
              No departments yet. Add one above.
            </p>
          </div>
        ) : data.map((dept, idx) => (
          <div key={dept._id} style={{
            padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14,
            borderBottom: idx < data.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: 'var(--primary-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={18} style={{ color: 'var(--primary)' }} />
            </div>

            {editId === dept._id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, background: 'var(--bg)', border: '1.5px solid var(--ink)',
                    borderRadius: 10, padding: '8px 14px',
                    fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--ink)', outline: 'none',
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') updateMut.mutate(); if (e.key === 'Escape') setEditId(null); }}
                />
                <button onClick={() => updateMut.mutate()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--civic)', padding: 6 }}>
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 6 }}>
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--ink)' }}>
                  {dept.name}
                </span>
                {dept.issueCount !== undefined && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-3)' }}>
                    {dept.issueCount} issues
                  </span>
                )}
                <button
                  onClick={() => { setEditId(dept._id); setEditName(dept.name); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 6 }}
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
