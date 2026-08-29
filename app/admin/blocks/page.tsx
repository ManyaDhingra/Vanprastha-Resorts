"use client"

import * as React from 'react'
import Image from 'next/image'
import { apiFetch, formatINR } from '@/lib/utils'
import { BedDouble, Edit, Trash2 } from 'lucide-react'

interface AdminBlock {
  id: string
  name: string
  slug: string
  description: string
  category: string
  view: string
  startingPrice: number
  image: string
  isActive: boolean
  _count: { rooms: number }
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  category: '',
  view: '',
  startingPrice: 12000,
  image: '/images/rooms/',
}

type FormState = typeof EMPTY_FORM

export default function AdminBlocks() {
  const [blocks, setBlocks] = React.useState<AdminBlock[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingForm, setEditingForm] = React.useState<FormState | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    apiFetch<AdminBlock[]>('/api/admin/blocks')
      .then(setBlocks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(load, [load])

  function set<K extends keyof FormState>(key: K, value: FormState[K], target: 'create' | 'edit') {
    if (target === 'create') setForm((f) => ({ ...f, [key]: value }))
    else setEditingForm((f) => (f ? { ...f, [key]: value } : f))
  }

  async function createBlock() {
    if (busy) return
    setBusy('create')
    setError(null)
    try {
      await apiFetch('/api/admin/blocks', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          startingPrice: Number(form.startingPrice),
        }),
      })
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create block.')
    } finally {
      setBusy(null)
    }
  }

  async function updateBlock(id: string) {
    if (busy || !editingForm) return
    setBusy(id)
    setError(null)
    try {
      await apiFetch(`/api/admin/blocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editingForm,
          startingPrice: Number(editingForm.startingPrice),
        }),
      })
      setEditingId(null)
      setEditingForm(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update block.')
    } finally {
      setBusy(null)
    }
  }

  async function deleteBlock(block: AdminBlock) {
    if (busy) return
    if (block._count.rooms > 0) {
      setError(`Cannot delete "${block.name}" — ${block._count.rooms} room(s) are assigned. Unassign them first.`)
      return
    }
    if (!window.confirm(`Delete block "${block.name}" permanently?`)) return
    setBusy(block.id)
    setError(null)
    try {
      await apiFetch(`/api/admin/blocks/${block.id}`, { method: 'DELETE' })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete block.')
    } finally {
      setBusy(null)
    }
  }

  function startEdit(block: AdminBlock) {
    setEditingId(block.id)
    setEditingForm({
      name: block.name,
      slug: block.slug,
      description: block.description,
      category: block.category,
      view: block.view,
      startingPrice: block.startingPrice,
      image: block.image,
    })
  }

  const fieldCls = 'w-full rounded-md border border-border px-3 py-2 text-sm'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Blocks</h1>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {createOpen ? 'Cancel' : '+ Add block'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {createOpen && (
        <div className="mb-6 grid gap-3 rounded-xl border border-border/60 bg-surface p-4 shadow-card sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-sm font-semibold text-text">New block</h2>
          {(
            [
              ['name', 'Name'],
              ['slug', 'Slug (url)'],
              ['category', 'Category'],
              ['view', 'View type'],
              ['startingPrice', 'Starting price (₹)'],
              ['image', 'Image path'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <label className="text-xs text-text-muted">{label}</label>
              <input
                className={fieldCls}
                value={form[key]}
                onChange={(e) => set(key, key === 'startingPrice' ? Number(e.target.value) : e.target.value, 'create')}
              />
            </div>
          ))}
          <div className="grid gap-1 sm:col-span-2">
            <label className="text-xs text-text-muted">Description</label>
            <textarea
              className={fieldCls}
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value, 'create')}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="button"
              disabled={busy === 'create'}
              onClick={() => void createBlock()}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === 'create' ? 'Creating…' : 'Create block'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Loading blocks…</p>
      ) : blocks.length === 0 ? (
        <p className="text-sm text-text-muted">No blocks yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="rounded-xl border border-border/60 bg-surface p-4 shadow-card"
            >
              {editingId === block.id && editingForm ? (
                <div className="grid gap-3">
                  <h2 className="text-sm font-semibold text-text">Edit — {block.name}</h2>
                  {(
                    [
                      ['name', 'Name'],
                      ['slug', 'Slug (url)'],
                      ['category', 'Category'],
                      ['view', 'View type'],
                      ['startingPrice', 'Starting price (₹)'],
                      ['image', 'Image path'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="grid gap-1">
                      <label className="text-xs text-text-muted">{label}</label>
                      <input
                        className={fieldCls}
                        value={editingForm[key]}
                        onChange={(e) => set(key, key === 'startingPrice' ? Number(e.target.value) : e.target.value, 'edit')}
                      />
                    </div>
                  ))}
                  <div className="grid gap-1">
                    <label className="text-xs text-text-muted">Description</label>
                    <textarea
                      className={fieldCls}
                      rows={2}
                      value={editingForm.description}
                      onChange={(e) => set('description', e.target.value, 'edit')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy === block.id}
                      onClick={() => void updateBlock(block.id)}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {busy === block.id ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setEditingForm(null) }}
                      className="rounded-full border border-border px-4 py-2 text-sm text-text-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Image
                      src={block.image}
                      alt={block.name}
                      width={80}
                      height={56}
                      className="h-14 w-20 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text">{block.name}</h3>
                        {!block.isActive && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-text-muted">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                          {block._count.rooms} rooms
                        </span>
                        <span>·</span>
                        <span>{block.category}</span>
                        <span>·</span>
                        <span>{block.view}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">/{block.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text">
                        {formatINR(block.startingPrice)}
                        <span className="text-xs font-normal text-text-muted">/night</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-text-muted">{block.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(block)}
                      className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-secondary"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy === block.id || block._count.rooms > 0}
                      onClick={() => void deleteBlock(block)}
                      className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
