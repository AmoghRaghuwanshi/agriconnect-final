'use client';

import { useState } from 'react';
import { INDIAN_STATES } from '@/lib/constants/states';

export interface AddressData {
  label: string;
  address_line1: string;
  address_line2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

interface AddressFormProps {
  initial?: Partial<AddressData>;
  onSubmit: (data: AddressData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function AddressForm({
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save Address',
}: AddressFormProps) {
  const [form, setForm] = useState<AddressData>({
    label: initial.label ?? 'Home',
    address_line1: initial.address_line1 ?? '',
    address_line2: initial.address_line2 ?? '',
    city: initial.city ?? '',
    district: initial.district ?? '',
    state: initial.state ?? '',
    pincode: initial.pincode ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.address_line1 || !form.city || !form.state || !form.pincode) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof AddressData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Label */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="addr-label">Label</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Home', 'Office', 'Warehouse', 'Other'].map((l) => (
            <button
              key={l}
              type="button"
              id={`label-${l.toLowerCase()}`}
              onClick={() => update('label', l)}
              className={`btn btn-sm ${form.label === l ? 'btn-primary' : 'btn-outline'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Address Line 1 */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="addr-line1">
          Address Line 1 <span style={{ color: '#DC2626' }}>*</span>
        </label>
        <input
          id="addr-line1"
          className="input"
          placeholder="House/Flat no., Building, Street"
          value={form.address_line1}
          onChange={(e) => update('address_line1', e.target.value)}
          required
        />
      </div>

      {/* Address Line 2 */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="addr-line2">Address Line 2</label>
        <input
          id="addr-line2"
          className="input"
          placeholder="Locality, Area (optional)"
          value={form.address_line2}
          onChange={(e) => update('address_line2', e.target.value)}
        />
      </div>

      {/* City + District */}
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="addr-city">
            City <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            id="addr-city"
            className="input"
            placeholder="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="addr-district">District</label>
          <input
            id="addr-district"
            className="input"
            placeholder="District"
            value={form.district}
            onChange={(e) => update('district', e.target.value)}
          />
        </div>
      </div>

      {/* State + Pincode */}
      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="addr-state">
            State <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <select
            id="addr-state"
            className="input"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            required
            style={{ cursor: 'pointer' }}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="addr-pincode">
            Pincode <span style={{ color: '#DC2626' }}>*</span>
          </label>
          <input
            id="addr-pincode"
            className="input"
            placeholder="6-digit pincode"
            value={form.pincode}
            onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
          />
        </div>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        {onCancel && (
          <button type="button" id="addr-cancel-btn" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" id="addr-submit-btn" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: '1rem', height: '1rem' }} /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
