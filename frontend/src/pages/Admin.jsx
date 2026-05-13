import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const EMPTY_EVENT = {
  title: '', description: '', type: 'soiree', university_id: '', venue: '',
  city: '', date: '', time: '20:00', price_standard: '', price_vip: '', capacity: 200, dress_code: ''
}

function StatCard({ emoji, label, value, color = 'text-purple-700 dark:text-purple-400' }) {
  return (
    <div className="card p-6">
      <div className="text-3xl mb-2">{emoji}</div>
      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
      <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{label}</div>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [universities, setUniversities] = useState([])
  const [allTickets, setAllTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_EVENT)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data))
    api.get('/universities').then(r => setUniversities(r.data))
  }, [])

  useEffect(() => {
    if (tab === 'events') api.get('/events').then(r => setEvents(r.data))
    if (tab === 'users') api.get('/admin/users').then(r => setUsers(r.data))
    if (tab === 'tickets') api.get('/admin/tickets').then(r => setAllTickets(r.data))
  }, [tab])

  const handleField = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }))

  const openCreate = () => { setEditId(null); setFormData(EMPTY_EVENT); setShowForm(true) }
  const openEdit = ev => {
    setEditId(ev.id)
    setFormData({
      title: ev.title, description: ev.description || '', type: ev.type,
      university_id: ev.university_id || '', venue: ev.venue, city: ev.city,
      date: ev.date, time: ev.time, price_standard: ev.price_standard, price_vip: ev.price_vip,
      capacity: ev.capacity, dress_code: ev.dress_code || '', status: ev.status
    })
    setShowForm(true)
  }

  const saveEvent = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/events/${editId}`, { ...formData, status: formData.status || 'published' })
        toast.success('Événement mis à jour ✓')
      } else {
        await api.post('/events', formData)
        toast.success('Événement créé ✓')
      }
      setShowForm(false)
      api.get('/events').then(r => setEvents(r.data))
      api.get('/admin/stats').then(r => setStats(r.data))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async id => {
    if (!confirm('Supprimer cet événement et tous ses billets ?')) return
    try {
      await api.delete(`/events/${id}`)
      toast.success('Événement supprimé')
      setEvents(ev => ev.filter(e => e.id !== id))
      api.get('/admin/stats').then(r => setStats(r.data))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role })
      toast.success('Rôle mis à jour')
      setUsers(us => us.map(u => u.id === userId ? { ...u, role } : u))
    } catch {
      toast.error('Erreur')
    }
  }

  const TABS = [
    { key: 'dashboard', label: '📊 Dashboard' },
    { key: 'events', label: '🎉 Événements' },
    { key: 'users', label: '👥 Utilisateurs' },
    { key: 'tickets', label: '🎫 Billets' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">⚙️ Administration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les événements, utilisateurs et billets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              tab === t.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard emoji="🎉" label="Événements publiés" value={stats.totalEvents} />
            <StatCard emoji="👥" label="Utilisateurs inscrits" value={stats.totalUsers} />
            <StatCard emoji="🎫" label="Billets vendus" value={stats.totalTickets} />
            <StatCard emoji="💰" label="Revenus totaux" value={`${stats.totalRevenue.toLocaleString()} MAD`} color="text-green-600 dark:text-green-400" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent tickets */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Dernières réservations</h3>
              <div className="space-y-3">
                {stats.recentTickets.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{t.user_name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{t.event_title}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-purple-700 dark:text-purple-400 text-sm">{t.total_price} MAD</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.quantity} billet(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Top events */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top événements</h3>
              <div className="space-y-3">
                {stats.topEvents.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300 dark:text-gray-600 w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{e.title}</p>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1">
                        <div className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${(e.tickets_sold / e.capacity) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{e.tickets_sold}/{e.capacity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVENTS */}
      {tab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{events.length} événements</h2>
            <button onClick={openCreate} className="btn-primary py-2 px-5">+ Nouvel événement</button>
          </div>

          {/* Event Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editId ? 'Modifier l\'événement' : 'Nouvel événement'}</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">×</button>
                </div>
                <form onSubmit={saveEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Titre *</label>
                      <input name="title" required className="input" value={formData.title} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Type *</label>
                      <select name="type" className="input dark:bg-gray-800" value={formData.type} onChange={handleField}>
                        <option value="soiree">🌙 Soirée</option>
                        <option value="gala">✨ Gala</option>
                        <option value="universite">🎓 Universitaire</option>
                        <option value="concert">🎵 Concert</option>
                        <option value="autre">🎉 Autre</option>
                      </select>
                    </div>
                    {formData.type === 'universite' && (
                      <div>
                        <label className="label">Université</label>
                        <select name="university_id" className="input dark:bg-gray-800" value={formData.university_id} onChange={handleField}>
                          <option value="">— Choisir —</option>
                          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="label">Ville *</label>
                      <input name="city" required className="input" value={formData.city} onChange={handleField} />
                    </div>
                    <div className={formData.type === 'universite' ? 'col-span-2' : ''}>
                      <label className="label">Lieu *</label>
                      <input name="venue" required className="input" value={formData.venue} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Date *</label>
                      <input name="date" type="date" required className="input" value={formData.date} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Heure *</label>
                      <input name="time" type="time" required className="input" value={formData.time} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Prix Standard (MAD)</label>
                      <input name="price_standard" type="number" min="0" className="input" value={formData.price_standard} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Prix VIP (MAD)</label>
                      <input name="price_vip" type="number" min="0" className="input" value={formData.price_vip} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Capacité</label>
                      <input name="capacity" type="number" min="1" className="input" value={formData.capacity} onChange={handleField} />
                    </div>
                    <div>
                      <label className="label">Dress Code</label>
                      <input name="dress_code" className="input" value={formData.dress_code} onChange={handleField} placeholder="Ex: Smart casual" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Description</label>
                      <textarea name="description" rows={4} className="input resize-none" value={formData.description} onChange={handleField} />
                    </div>
                    {editId && (
                      <div>
                        <label className="label">Statut</label>
                        <select name="status" className="input dark:bg-gray-800" value={formData.status} onChange={handleField}>
                          <option value="published">Publié</option>
                          <option value="draft">Brouillon</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                      {saving ? 'Sauvegarde...' : editId ? 'Mettre à jour' : 'Créer l\'événement'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Annuler</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Events Table */}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Événement', 'Type', 'Date', 'Ville', 'Billets', 'Prix', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {events.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{e.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${e.type === 'gala' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : e.type === 'soiree' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : e.type === 'universite' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        {e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{e.date}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{e.city}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${e.tickets_sold / e.capacity > 0.8 ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {e.tickets_sold}/{e.capacity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-purple-700 dark:text-purple-400">{e.price_standard} MAD</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${e.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : e.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(e)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-xs px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20">
                          ✏️ Modifier
                        </button>
                        <button onClick={() => deleteEvent(e.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium text-xs px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {events.length === 0 && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">Aucun événement. Créez le premier !</div>
            )}
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{users.length} utilisateurs inscrits</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Utilisateur', 'Email', 'Université', 'Billets', 'Rôle', 'Inscrit le'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.university_name || '—'}</td>
                    <td className="px-4 py-3 font-medium text-purple-700 dark:text-purple-400">{u.ticket_count}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-400">
                        <option value="user">Utilisateur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('fr-MA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TICKETS */}
      {tab === 'tickets' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{allTickets.length} billets vendus</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Acheteur', 'Événement', 'Type', 'Qté', 'Total', 'Date achat'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {allTickets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{t.user_name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">{t.event_title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.city} — {t.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${t.ticket_type === 'vip' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                        {t.ticket_type === 'vip' ? '⭐ VIP' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{t.quantity}</td>
                    <td className="px-4 py-3 font-bold text-purple-700 dark:text-purple-400">{t.total_price} MAD</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{new Date(t.purchased_at).toLocaleString('fr-MA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allTickets.length === 0 && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">Aucun billet vendu pour le moment.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
