import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api/axios'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [saving, setSaving] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 20

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setMessage({ type: 'error', text: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser({ ...user })
    setDeleteConfirm(null)
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    try {
      const response = await api.put(`/admin/users/${editingUser.id}`, editingUser)
      setUsers(users.map(u => u.id === editingUser.id ? response.data.data : u))
      setEditingUser(null)
      setMessage({ type: 'success', text: 'User updated successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Failed to update user:', error)
      setMessage({ type: 'error', text: 'Failed to update user' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId) => {
    setSaving(true)
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      setDeleteConfirm(null)
      setMessage({ type: 'success', text: 'User deleted successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Failed to delete user:', error)
      setMessage({ type: 'error', text: 'Failed to delete user' })
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    } finally {
      setSaving(false)
    }
  }

  const updateEditingUser = (field, value) => {
    setEditingUser(prev => ({ ...prev, [field]: value }))
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-600 mt-1">Review and manage all platform users</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name or email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="landlord">Landlord</option>
          <option value="tenant">Tenant</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {user.name || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'landlord' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.phone || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{user.city || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No users found</p>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">User Details</h3>
              
              <div className="space-y-4">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  {viewingUser.profile_image ? (
                    <img
                      src={viewingUser.profile_image.startsWith('http') ? viewingUser.profile_image : `http://localhost:5000${viewingUser.profile_image}`}
                      alt={viewingUser.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-gray-200">
                      {viewingUser.name ? viewingUser.name.charAt(0).toUpperCase() : viewingUser.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 font-medium">Name</span>
                    <p className="text-gray-900 mt-1">{viewingUser.name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Email</span>
                    <p className="text-gray-900 mt-1">{viewingUser.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Phone</span>
                    <p className="text-gray-900 mt-1">{viewingUser.phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">City</span>
                    <p className="text-gray-900 mt-1">{viewingUser.city || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Role</span>
                    <p className="text-gray-900 mt-1 capitalize">{viewingUser.role || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Email Verified</span>
                    <p className="text-gray-900 mt-1">{viewingUser.is_email_verified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 font-medium">Created At</span>
                    <p className="text-gray-900 mt-1">
                      {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEdit(viewingUser)
                    setViewingUser(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => updateEditingUser('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => updateEditingUser('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => updateEditingUser('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                  <select
                    value={editingUser.role || 'tenant'}
                    onChange={(e) => updateEditingUser('role', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                  <input
                    type="text"
                    value={editingUser.city || ''}
                    onChange={(e) => updateEditingUser('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={saving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminUsers
