import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const res = await api.put('/api/users/profile', { name });
      updateUser(res.data.user);
      toast.success('Name updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPass(true);
    try {
      await api.put('/api/users/profile', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      });
      setPasswords({ current: '', newPass: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  const setP = (k) => (e) => setPasswords(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page fade-in">
      <Toast toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem', maxWidth: 900 }}>
        {/* Profile Info */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <Avatar name={user?.name || '?'} size="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>
          <form onSubmit={handleNameSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="section-title">Update Name</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingName} style={{ alignSelf: 'flex-start' }}>
              {savingName ? '⏳ Saving…' : '💾 Save Name'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 className="section-title">Change Password</h3>
          <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input className="input" type="password" value={passwords.current} onChange={setP('current')} placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="input" type="password" value={passwords.newPass} onChange={setP('newPass')} placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="input" type="password" value={passwords.confirm} onChange={setP('confirm')} placeholder="Repeat new password" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingPass} style={{ alignSelf: 'flex-start' }}>
              {savingPass ? '⏳ Changing…' : '🔐 Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
