import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'

interface Image {
  id: number
  url: string
  caption: string
  is_cover: boolean
}

interface Equipment {
  id: number
  name: string
  pivot?: { quantity: number }
}

interface Space {
  id: number
  name: string
  description: string
  capacity: number
  price_per_hour: number
  location: string
  status: string
  images: Image[]
  equipments: Equipment[]
  is_currently_reserved: boolean
  active_reservation: { end_at: string; user_name?: string } | null
  next_reservation: { start_at: string } | null
}

interface Props {
  space: Space
  isAdmin: boolean
  onClose: () => void
  onReserve?: (space: Space) => void
}

export default function SpaceDetailModal({ space, isAdmin, onClose, onReserve }: Props) {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const images = space.images ?? []
  const canBook = !space.is_currently_reserved && space.status === 'available'

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData()
      Array.from(files).forEach(f => formData.append('images[]', f))
      return api.post(`/api/spaces/${space.id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      setUploadError('')
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.message || 'Erreur upload')
    },
    onSettled: () => setUploading(false),
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) =>
      api.delete(`/api/spaces/${space.id}/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      setActiveImg(0)
    },
  })

  const coverMutation = useMutation({
    mutationFn: (imageId: number) =>
      api.patch(`/api/spaces/${space.id}/images/${imageId}/cover`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    uploadMutation.mutate(e.target.files)
  }

  const statusColor = space.is_currently_reserved
    ? 'bg-red-500/20 text-red-400'
    : space.status === 'available'
      ? 'bg-emerald-500/20 text-emerald-400'
      : 'bg-gray-500/20 text-gray-400'

  const statusLabel = space.is_currently_reserved
    ? 'Réservé'
    : space.status === 'available'
      ? 'Disponible'
      : space.status === 'maintenance'
        ? 'Maintenance'
        : 'Indisponible'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ background: '#0f0f17', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Galerie photos */}
        <div className="relative">
          {images.length > 0 ? (
            <div>
              {/* Photo principale */}
              <div className="relative h-64 overflow-hidden rounded-t-3xl bg-gray-900">
                <img
                  src={images[activeImg]?.url}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
                {images[activeImg]?.is_cover && (
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: 'rgba(99,102,241,0.8)' }}>
                    Photo principale
                  </span>
                )}
                {/* Actions admin sur photo active */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    {!images[activeImg]?.is_cover && (
                      <button
                        onClick={() => coverMutation.mutate(images[activeImg].id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all"
                        style={{ background: 'rgba(99,102,241,0.8)' }}
                      >
                        Définir comme principale
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(images[activeImg].id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 transition-all"
                      style={{ background: 'rgba(239,68,68,0.2)' }}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto"
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(i)}
                      className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                      style={{
                        border: i === activeImg
                          ? '2px solid #6366f1'
                          : '2px solid transparent',
                        opacity: i === activeImg ? 1 : 0.5,
                      }}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 rounded-t-3xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.05)' }}>
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-20">{space.name.charAt(0)}</div>
                <p className="text-white/20 text-sm">Aucune photo disponible</p>
              </div>
            </div>
          )}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(0,0,0,0.5)', ...(images.length > 0 && isAdmin ? { top: '3rem' } : {}) }}
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-5">

          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {space.name}
              </h2>
              <p className="text-white/40 text-sm mt-1">{space.location}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {statusLabel}
              </span>
              <p className="text-white font-bold text-xl mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                {Number(space.price_per_hour).toLocaleString()}
                <span className="text-white/30 text-sm font-normal ml-1">FCFA/h</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/50 text-sm leading-relaxed">{space.description}</p>

          {/* Infos clés */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Capacité', value: `${space.capacity} personnes` },
              { label: 'Prix/heure', value: `${Number(space.price_per_hour).toLocaleString()} FCFA` },
              { label: 'Localisation', value: space.location || '—' },
              { label: 'Statut', value: statusLabel },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/30 text-xs mb-1">{label}</p>
                <p className="text-white/80 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Réservation en cours */}
          {space.is_currently_reserved && space.active_reservation && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-red-400 text-sm font-medium mb-1">Actuellement occupé</p>
              <p className="text-red-400/60 text-xs">
                Libéré le {space.active_reservation.end_at}
                {isAdmin && space.active_reservation.user_name && (
                  <span> — par {space.active_reservation.user_name}</span>
                )}
              </p>
            </div>
          )}

          {/* Prochaine réservation */}
          {!space.is_currently_reserved && space.next_reservation && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="text-amber-400 text-sm font-medium mb-1">Prochaine réservation</p>
              <p className="text-amber-400/60 text-xs">
                À partir du {space.next_reservation.start_at}
              </p>
            </div>
          )}

          {/* Équipements */}
          {space.equipments?.length > 0 && (
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                Équipements inclus
              </p>
              <div className="flex flex-wrap gap-2">
                {space.equipments.map(eq => (
                  <span key={eq.id}
                    className="px-3 py-1.5 rounded-full text-xs text-white/60"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    {eq.name}
                    {eq.pivot?.quantity && eq.pivot.quantity > 1
                      ? ` × ${eq.pivot.quantity}`
                      : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Upload photos — admin seulement */}
          {isAdmin && (
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <p className="text-indigo-300/60 text-xs uppercase tracking-widest mb-3">
                Gérer les photos
              </p>

              {uploadError && (
                <p className="text-red-400 text-xs mb-3">{uploadError}</p>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl text-sm font-medium text-indigo-300 transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px dashed rgba(99,102,241,0.3)',
                }}
              >
                {uploading
                  ? 'Upload en cours...'
                  : '+ Ajouter des photos (JPEG, PNG, WebP — max 5MB)'}
              </button>

              {images.length > 0 && (
                <p className="text-white/20 text-xs mt-2 text-center">
                  {images.length} photo(s) — Cliquez sur une miniature pour la sélectionner
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {!isAdmin && onReserve && (
              <button
                onClick={() => { onClose(); onReserve(space) }}
                disabled={!canBook}
                className="flex-1 py-3 rounded-2xl text-sm font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={canBook ? {
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 8px 25px rgba(99,102,241,0.3)',
                } : { background: 'rgba(255,255,255,0.05)' }}
              >
                {canBook ? 'Réserver cet espace →' : 'Indisponible'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl text-sm text-white/40 hover:text-white/60 transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Fermer
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}