import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/axios'

interface Reservation {
  id: number
  space: { name: string }
  start_at: string
  end_at: string
  status: string
  total_price: number
  payment_status: string
  payment_reference: string
  notes: string
}

export default function MemberDashboard() {
  const queryClient = useQueryClient()
  const [payingId, setPayingId] = useState<number | null>(null)
  const [paidRef, setPaidRef] = useState<string>('')

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['member-reservations'],
    queryFn: async () => {
      const res = await api.get('/api/reservations')
      const result = res.data
      return (Array.isArray(result) ? result : result.data) ?? []
    },
  })

  const payMutation = useMutation({
    mutationFn: (id: number) => api.post(`/api/reservations/${id}/pay`),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['member-reservations'] })
      setPaidRef(data.reference)
      setPayingId(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/reservations/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['member-reservations'] }),
  })

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending:   { label: 'En attente', color: 'bg-yellow-50 text-yellow-700' },
    confirmed: { label: 'Confirmée',  color: 'bg-green-50 text-green-700'   },
    cancelled: { label: 'Annulée',    color: 'bg-red-50 text-red-700'       },
  }

  const paymentLabel: Record<string, { label: string; color: string }> = {
    unpaid:   { label: 'Non payé',   color: 'bg-orange-50 text-orange-700' },
    paid:     { label: 'Payé',       color: 'bg-green-50 text-green-700'   },
    refunded: { label: 'Remboursé',  color: 'bg-gray-50 text-gray-600'     },
  }

  const pending   = reservations?.filter((r: Reservation) => r.status === 'pending').length ?? 0
  const confirmed = reservations?.filter((r: Reservation) => r.status === 'confirmed').length ?? 0
  const unpaid    = reservations?.filter((r: Reservation) =>
    r.payment_status === 'unpaid' && r.status !== 'cancelled'
  ).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Mes réservations</h2>
        <p className="text-gray-500 text-sm mt-1">
          Gérez et payez vos réservations
        </p>
      </div>

      {paidRef && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 flex items-center justify-between">
          <span>
            Paiement effectué avec succès ! Référence : <strong>{paidRef}</strong>
          </span>
          <button
            onClick={() => setPaidRef('')}
            className="text-green-500 hover:underline ml-4"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-semibold text-yellow-600">{pending}</p>
          <p className="text-sm text-gray-500 mt-1">En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-semibold text-green-600">{confirmed}</p>
          <p className="text-sm text-gray-500 mt-1">Confirmées</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-semibold text-orange-600">{unpaid}</p>
          <p className="text-sm text-gray-500 mt-1">À payer</p>
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Chargement...
        </div>
      ) : !reservations || reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">
            Vous n'avez pas encore de réservation
          </p>
          <Link
            to="/member/spaces"
            className="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Réserver un espace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r: Reservation) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{r.space?.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Du {r.start_at} au {r.end_at}
                  </p>
                  {r.payment_status === 'paid' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Réf. : {r.payment_reference}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusLabel[r.status]?.color}`}>
                    {statusLabel[r.status]?.label}
                  </span>
                  <br />
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${paymentLabel[r.payment_status]?.color}`}>
                    {paymentLabel[r.payment_status]?.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <p className="font-semibold text-gray-800">
                  {Number(r.total_price).toLocaleString()} FCFA
                </p>
                <div className="flex gap-3 items-center">
                  {r.payment_status === 'unpaid' && r.status !== 'cancelled' && (
                    payingId === r.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Confirmer le paiement ?
                        </span>
                        <button
                          onClick={() => payMutation.mutate(r.id)}
                          disabled={payMutation.isPending}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {payMutation.isPending ? 'En cours...' : 'Payer'}
                        </button>
                        <button
                          onClick={() => setPayingId(null)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPayingId(r.id)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Payer maintenant
                      </button>
                    )
                  )}

                  {r.status !== 'cancelled' && r.payment_status !== 'paid' && (
                    <button
                      onClick={() => cancelMutation.mutate(r.id)}
                      className="px-4 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}