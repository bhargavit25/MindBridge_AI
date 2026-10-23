import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
  const { user, updateUserState } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {};
      if (displayName.trim()) payload.display_name = displayName.trim();
      if (newPassword) payload.password = newPassword;

      const updated = await api.updateProfile(payload);
      updateUserState({ display_name: updated.display_name });
      setNotice('Profile updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12 font-sans text-[#293B38]">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#293B38] tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D]">
          Manage your personal profile and security credentials.
        </p>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#294A40]" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-700" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-[#FBFAF6] p-6 sm:p-7 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5] font-semibold text-xl flex items-center justify-center uppercase">
            {user?.display_name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-0.5">
            <h2 className="font-semibold text-base text-[#293B38]">{user?.display_name}</h2>
            <div className="text-xs text-[#78817D] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#969D97]" />
              <span>{user?.email}</span>
            </div>
            <div className="pt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5]">
                {user?.role} Account
              </span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-4 pt-2 border-t border-[#E5E8DF]">
          <div>
            <label className="block text-xs font-medium text-[#78817D] mb-1">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] focus:outline-none focus:border-[#294A40]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#78817D] mb-1">
              New Password (leave blank to keep current)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (optional)"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] focus:outline-none focus:border-[#294A40]"
              />
            </div>
          </div>

          {newPassword && (
            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] focus:outline-none focus:border-[#294A40]"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>

    </div>
  );
};
