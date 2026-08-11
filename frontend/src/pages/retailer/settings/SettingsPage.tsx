import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/api/v1/settings');
      setSettings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await apiClient.put('/api/v1/settings', {
        business_name: settings.business_name,
        owner_name: settings.owner_name,
        phone: settings.phone,
        address: settings.address,
        settings_json: settings.settings_json,
      });
      setSettings(res.data.data);
      setMessage('Settings updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.error?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Retailer Workspace Settings</h1>
      {message && <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">{message}</div>}
      <form onSubmit={handleSave} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.business_name || ''}
            onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Owner Name</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.owner_name || ''}
            onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.phone || ''}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.settings_json?.currency || 'USD'}
            onChange={(e) => setSettings({
              ...settings,
              settings_json: { ...settings.settings_json, currency: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Receipt Header</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.settings_json?.receipt_header || ''}
            onChange={(e) => setSettings({
              ...settings,
              settings_json: { ...settings.settings_json, receipt_header: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Receipt Footer</label>
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={settings?.settings_json?.receipt_footer || ''}
            onChange={(e) => setSettings({
              ...settings,
              settings_json: { ...settings.settings_json, receipt_footer: e.target.value }
            })}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};