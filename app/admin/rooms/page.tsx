"use client"

import * as React from 'react'
import Image from 'next/image'
import { apiFetch, formatINR } from '@/lib/utils'
import { BedDouble, CheckCircle2, XCircle } from 'lucide-react'

interface BlockInfo {
  id: string
  name: string
  slug: string
}

interface AdminRoom {
  id: string
  slug: string
  title: string
  category: string
  description: string
  capacity: number
  size: number
  pricePerNight: number
  image: string
  highlights: string[]
  isActive: boolean
  blockId: string | null
  blockRelation: BlockInfo | null
  _count: { bookings: number }
}

interface BlockSummary {
  id: string
  name: string
  slug: string
  roomCount: number
  category: string
  view: string
  startingPrice: number
  description: string
  image: string
}

const EMPTY_FORM = {
  slug: '',
  title: '',
  category: '',
  description: '',
  capacity: 2,
  size: 400,
  pricePerNight: 12000,
  image: '',
  highlights: '',
  blockId: '',
}

type FormState = typeof EMPTY_FORM

export default function AdminRooms() {
  const [rooms, setRooms] = React.useState<AdminRoom[]>([])
  const [blocks, setBlocks] = React.useState<BlockSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingForm, setEditingForm] = React.useState<FormState | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    Promise.all([
      apiFetch<AdminRoom[]>('/api/admin/rooms'),
      apiFetch<BlockSummary[]>('/api/admin/blocks'),
    ])
      .then(([r, b]) => { setRooms(r); setBlocks(b) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(load, [load])

  function set<K extends keyof FormState>(key: K, value: FormState[K], target: 'create' | 'edit') {
    if (target === 'create') setForm((f) => ({ ...f, [key]: value }))
    else setEditingForm((f) => (f ? { ...f, [key]: value } : f))
  }

  async function createRoom() {
    if (busy) return
    setBusy('create')
    setError(null)
    try {
      await apiFetch('/api/admin/rooms', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          size: Number(form.size),
          pricePerNight: Number(form.pricePerNight),
          highlights: form.highlights
            ? form.highlights.split(',').map((s) => s.trim()).filter(Boolean)
            : undefined,
          blockId: form.blockId || null,
        }),
      })
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room.')
    } finally {
      setBusy(null)
    }
  }

  async function updateRoom(id: string) {
    if (busy || !editingForm) return
    setBusy(id)
    setError(null)
    try {
      await apiFetch(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editingForm,
          capacity: Number(editingForm.capacity),
          size: Number(editingForm.size),
          pricePerNight: Number(editingForm.pricePerNight),
          highlights: editingForm.highlights
            ? editingForm.highlights.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          isActive: true,
          blockId: editingForm.blockId || null,
        }),
      })
      setEditingId(null)
      setEditingForm(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update room.')
    } finally {
      setBusy(null)
    }
  }

  async function toggleActive(room: AdminRoom) {
    if (busy) return
    setBusy(room.id)
    setError(null)
    try {
      await apiFetch(`/api/admin/rooms/${room.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          slug: room.slug,
          title: room.title,
          category: room.category,
          description: room.description,
          capacity: room.capacity,
          size: room.size,
          pricePerNight: room.pricePerNight,
          image: room.image,
          highlights: room.highlights,
          isActive: !room.isActive,
          blockId: room.blockId,
        }),
      })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update room.')
    } finally {
      setBusy(null)
    }
  }

  async function deleteRoom(room: AdminRoom) {
    if (busy) return
    if (room._count.bookings > 0) {
      setError(
        `Room has ${room._count.bookings} booking record(s) — deactivate it instead of deleting.`
      )
      return
    }
    if (!window.confirm(`Delete room "${room.title}" permanently?`)) return
    setBusy(room.id)
    setError(null)
    try {
      await apiFetch(`/api/admin/rooms/${room.id}`, { method: 'DELETE' })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete room.')
    } finally {
      setBusy(null)
    }
  }

  function startEdit(room: AdminRoom) {
    setEditingId(room.id)
    setEditingForm({
      slug: room.slug,
      title: room.title,
      category: room.category,
      description: room.description,
      capacity: room.capacity,
      size: room.size,
      pricePerNight: room.pricePerNight,
      image: room.image,
      highlights: room.highlights.join(', '),
      blockId: room.blockId ?? '',
    })
  }

  const fieldCls =
    'w-full rounded-md border border-border px-3 py-2 text-sm'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Rooms</h1>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {createOpen ? 'Cancel' : '+ Add room'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {createOpen && (
        <div className="mb-6 grid gap-3 rounded-xl border border-border/60 bg-surface p-4 shadow-card sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-sm font-semibold text-text">
            New room
          </h2>
          {(
            [
              ['slug', 'Slug (url)'],
              ['title', 'Title'],
              ['category', 'Category'],
              ['pricePerNight', 'Price per night (₹)'],
              ['capacity', 'Capacity (guests)'],
              ['size', 'Size (sq ft)'],
              ['image', 'Image path'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <label className="text-xs text-text-muted">{label}</label>
              <input
                className={fieldCls}
                value={form[key]}
                onChange={(e) => set(key, e.target.value, 'create')}
              />
            </div>
          ))}
          <div className="grid gap-1">
            <label className="text-xs text-text-muted">Block</label>
            <select
              className={fieldCls}
              value={form.blockId}
              onChange={(e) => set('blockId', e.target.value, 'create')}
            >
              <option value="">No block</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1 sm:col-span-2">
            <label className="text-xs text-text-muted">Highlights (comma separated)</label>
            <input
              className={fieldCls}
              value={form.highlights}
              onChange={(e) => set('highlights', e.target.value, 'create')}
            />
          </div>
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
              onClick={() => void createRoom()}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === 'create' ? 'Creating…' : 'Create room'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Loading rooms…</p>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-text-muted">No rooms yet.</p>
      ) : (
        <>
          {/* Block Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {blocks.map((block) => {
              const blockRooms = rooms.filter((r) => r.blockId === block.id)
              const activeCount = blockRooms.filter((r) => r.isActive).length
              return (
                <div key={block.id} className="rounded-xl border border-border/60 bg-surface p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-2">
                    <BedDouble className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-text">{block.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span className="text-text-muted">{activeCount} active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="text-text-muted">{blockRooms.length - activeCount} inactive</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{blockRooms.length} / {block.roomCount} rooms</p>
                </div>
              )
            })}
          </div>

          {/* Rooms grouped by block */}
          {(() => {
            const grouped = new Map<string, AdminRoom[]>()
            for (const room of rooms) {
              const blockId = room.blockId ?? 'UNASSIGNED'
              const list = grouped.get(blockId) ?? []
              list.push(room)
              grouped.set(blockId, list)
            }

            return Array.from(grouped.entries()).map(([blockId, blockRooms]) => {
              const block = blocks.find((b) => b.id === blockId)
              return (
                <div key={blockId} className="mb-6">
                  <h2 className="mb-3 font-heading text-lg font-semibold text-text">
                    {block?.name ?? 'Unassigned Rooms'}
                  </h2>
                  <div className="grid gap-4">
                    {blockRooms.map((room) => (
                      <div
                        key={room.id}
                        className="rounded-xl border border-border/60 bg-surface p-4 shadow-card"
                      >
                        {editingId === room.id && editingForm ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <h2 className="sm:col-span-2 text-sm font-semibold text-text">
                              Edit — {room.title}
                            </h2>
                            {(
                              [
                                ['slug', 'Slug (url)'],
                                ['title', 'Title'],
                                ['category', 'Category'],
                                ['pricePerNight', 'Price per night (₹)'],
                                ['capacity', 'Capacity (guests)'],
                                ['size', 'Size (sq ft)'],
                                ['image', 'Image path'],
                              ] as const
                            ).map(([key, label]) => (
                              <div key={key} className="grid gap-1">
                                <label className="text-xs text-text-muted">{label}</label>
                                <input
                                  className={fieldCls}
                                  value={editingForm[key]}
                                  onChange={(e) => set(key, e.target.value, 'edit')}
                                />
                              </div>
                            ))}
                            <div className="grid gap-1">
                              <label className="text-xs text-text-muted">Block</label>
                              <select
                                className={fieldCls}
                                value={editingForm.blockId}
                                onChange={(e) => set('blockId', e.target.value, 'edit')}
                              >
                                <option value="">No block</option>
                                {blocks.map((b) => (
                                  <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid gap-1 sm:col-span-2">
                              <label className="text-xs text-text-muted">Highlights</label>
                              <input
                                className={fieldCls}
                                value={editingForm.highlights}
                                onChange={(e) => set('highlights', e.target.value, 'edit')}
                              />
                            </div>
                            <div className="grid gap-1 sm:col-span-2">
                              <label className="text-xs text-text-muted">Description</label>
                              <textarea
                                className={fieldCls}
                                rows={2}
                                value={editingForm.description}
                                onChange={(e) => set('description', e.target.value, 'edit')}
                              />
                            </div>
                            <div className="sm:col-span-2 flex gap-2">
                              <button
                                type="button"
                                disabled={busy === room.id}
                                onClick={() => void updateRoom(room.id)}
                                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                              >
                                {busy === room.id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null)
                                  setEditingForm(null)
                                }}
                                className="rounded-full border border-border px-4 py-2 text-sm text-text-muted"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-4">
                            <Image
                              src={room.image}
                              alt={room.title}
                              width={96}
                              height={64}
                              className="h-16 w-24 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-text">{room.title}</span>
                                {!room.isActive && (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-text-muted">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-text-muted">
                                {room.category} · {room.capacity} guests · {room.size} sq ft ·
                                {room._count.bookings} booking(s)
                              </div>
                              <div className="text-xs text-slate-400">/{room.slug}</div>
                            </div>
                            <div className="font-semibold text-text">
                              {formatINR(room.pricePerNight)}
                              <span className="text-xs font-normal text-text-muted">/night</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(room)}
                                className="rounded-md border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-secondary"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={busy === room.id}
                                onClick={() => void toggleActive(room)}
                                className="rounded-md border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-secondary disabled:opacity-50"
                              >
                                {busy === room.id ? '…' : room.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                disabled={busy === room.id || room._count.bookings > 0}
                                onClick={() => void deleteRoom(room)}
                                className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          })()}
        </>
      )}
    </div>
  )
}
