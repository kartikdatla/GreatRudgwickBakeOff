import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newInviteRole, setNewInviteRole] = useState('Baker');
  const [newInviteMaxUses, setNewInviteMaxUses] = useState(1);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, invitesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/invites')
      ]);
      setUsers(usersRes.data.users);
      setInvites(invitesRes.data.invites);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleRoleChange = async (userId, newRole) => {
    clearMessages();
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setSuccess('Role updated successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    clearMessages();
    const action = currentActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/active`, { isActive: !currentActive });
      setSuccess(`User ${action}d successfully`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    clearMessages();
    if (!window.confirm(`Are you sure you want to permanently delete ${userName}? This cannot be undone.`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess('User deleted');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await api.post('/admin/invites', {
        role: newInviteRole,
        maxUses: newInviteMaxUses
      });
      setSuccess(`Invite code created: ${res.data.invite.code}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invite code');
    }
  };

  const handleDeactivateInvite = async (inviteId) => {
    clearMessages();
    try {
      await api.patch(`/admin/invites/${inviteId}/deactivate`);
      setSuccess('Invite code deactivated');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to deactivate invite');
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    clearMessages();
    try {
      await api.delete(`/admin/invites/${inviteId}`);
      setSuccess('Invite code deleted');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete invite');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess(`Copied "${text}" to clipboard`);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Judge': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Baker': return 'bg-green-100 text-green-800 border-green-200';
      case 'Spectator': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">User Management</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-scale-in flex items-center gap-2">
          <span className="text-lg">✓</span> {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('users'); clearMessages(); }}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'users'
              ? 'bg-neutral-900 text-white shadow-lg scale-[1.02]'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab('invites'); clearMessages(); }}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'invites'
              ? 'bg-neutral-900 text-white shadow-lg scale-[1.02]'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Invite Codes ({invites.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card animate-fade-in">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Name</th>
                  <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Email</th>
                  <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Role</th>
                  <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                  <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Joined</th>
                  <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-neutral-100 transition-all duration-200 hover:bg-neutral-50 stagger-item ${!user.is_active ? 'opacity-50' : ''}`}
                    style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                  >
                    <td className="py-3.5 font-medium text-neutral-900">{user.name}</td>
                    <td className="py-3.5 text-neutral-500 text-sm">{user.email}</td>
                    <td className="py-3.5">
                      {user.role === 'Admin' ? (
                        <span className={`badge border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-neutral-300 rounded-lg px-2 py-1.5 bg-white hover:border-neutral-400 transition-colors cursor-pointer"
                        >
                          <option value="Baker">Baker</option>
                          <option value="Judge">Judge</option>
                          <option value="Spectator">Spectator</option>
                          <option value="Admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className={`badge border ${
                        user.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {user.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm text-neutral-400">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5">
                      {user.role !== 'Admin' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                              user.is_active
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-all duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <p className="text-neutral-400 text-center py-8">No users found</p>
          )}
        </div>
      )}

      {/* Invite Codes Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-6 animate-fade-in">
          {/* Create Invite Form */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-2">Create Invite Code</h2>
            <p className="text-neutral-500 text-sm mb-4">
              Generate a code to share with someone. The code determines their role when they register.
            </p>
            <form onSubmit={handleCreateInvite} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="label">Role</label>
                <select
                  value={newInviteRole}
                  onChange={(e) => setNewInviteRole(e.target.value)}
                  className="input"
                >
                  <option value="Baker">Baker</option>
                  <option value="Judge">Judge</option>
                  <option value="Spectator">Spectator</option>
                </select>
              </div>
              <div>
                <label className="label">Max Uses</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newInviteMaxUses}
                  onChange={(e) => setNewInviteMaxUses(parseInt(e.target.value) || 1)}
                  className="input w-24"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-luxury">
                Generate Code
              </button>
            </form>
          </div>

          {/* Invite Codes List */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Active Invite Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Code</th>
                    <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Role</th>
                    <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Uses</th>
                    <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                    <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Created</th>
                    <th className="pb-3 text-sm font-semibold text-neutral-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite, index) => (
                    <tr
                      key={invite.id}
                      className={`border-b border-neutral-100 transition-all duration-200 hover:bg-neutral-50 stagger-item ${!invite.is_active ? 'opacity-50' : ''}`}
                      style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                    >
                      <td className="py-3.5">
                        <button
                          onClick={() => copyToClipboard(invite.code)}
                          className="font-mono font-bold text-lg tracking-wider hover:text-primary-600 cursor-pointer transition-colors"
                          title="Click to copy"
                        >
                          {invite.code}
                        </button>
                      </td>
                      <td className="py-3.5">
                        <span className={`badge border ${getRoleBadgeColor(invite.role)}`}>
                          {invite.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-sm text-neutral-600">
                        <span className="font-semibold">{invite.uses}</span>
                        <span className="text-neutral-400"> / {invite.max_uses}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`badge border ${
                          invite.is_active && invite.uses < invite.max_uses
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {!invite.is_active ? 'Deactivated' : invite.uses >= invite.max_uses ? 'Fully Used' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 text-sm text-neutral-400">
                        {new Date(invite.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5">
                        <div className="flex gap-2">
                          {invite.is_active && invite.uses < invite.max_uses && (
                            <button
                              onClick={() => handleDeactivateInvite(invite.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-all duration-200"
                            >
                              Deactivate
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-all duration-200"
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

            {invites.length === 0 && (
              <p className="text-neutral-400 text-center py-8">No invite codes yet. Create one above to invite people.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
