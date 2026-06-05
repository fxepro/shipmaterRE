'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, Truck, Edit2, Trash2 } from 'lucide-react';

export function VehiclesTab() {
  const qc = useQueryClient();
  const { data: vehicles = [], isLoading, isError } = useQuery({
    queryKey: ['carrier-vehicles'],
    queryFn: () => api.get('/api/v1/carrier/vehicles').then(r => r.data?.data || []),
    retry: false,
  });

  const [showAddForm, setShowAddForm] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8">Loading vehicles...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <p className="text-sm text-yellow-800">Unable to load vehicles. Backend API not yet available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--color-text)]">Your Fleet</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in your fleet
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] transition-colors"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      {showAddForm && <AddVehicleForm onClose={() => setShowAddForm(false)} />}

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-cream)] rounded-lg border-2 border-dashed border-[var(--color-cream-dark)]">
          <Truck size={24} className="mx-auto text-[var(--color-text-faint)] mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">No vehicles yet</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">Add your first truck or trailer to start bidding on jobs</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((vehicle: any) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: any }) {
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/v1/carrier/vehicles/${vehicle.id}`),
    onSuccess: () => {
      toast.success('Vehicle removed');
    },
  });

  return (
    <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-[var(--color-slate)] flex items-center justify-center text-white">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-text)]">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h4>
            <p className="text-xs text-[var(--color-text-faint)] mt-1">{vehicle.type}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-[var(--color-cream)] rounded-lg transition-colors">
            <Edit2 size={16} className="text-[var(--color-text-muted)]" />
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">VIN</p>
            <p className="font-mono text-xs text-[var(--color-text)]">{vehicle.vin}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">License Plate</p>
            <p className="font-mono text-xs text-[var(--color-text)]">{vehicle.license_plate}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">GVWR</p>
            <p className="text-xs text-[var(--color-text)]">{vehicle.gvwr} lbs</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">Capacity</p>
            <p className="text-xs text-[var(--color-text)]">{vehicle.max_payload} lbs</p>
          </div>
        </div>

        {vehicle.features && (
          <div className="flex flex-wrap gap-1 pt-2">
            {vehicle.liftgate && <span className="text-xs px-2 py-1 bg-[var(--color-teal-pale)] text-[var(--color-teal)] rounded">Liftgate</span>}
            {vehicle.climate_controlled && <span className="text-xs px-2 py-1 bg-[var(--color-teal-pale)] text-[var(--color-teal)] rounded">Climate Ctrl</span>}
            {vehicle.enclosed && <span className="text-xs px-2 py-1 bg-[var(--color-teal-pale)] text-[var(--color-teal)] rounded">Enclosed</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function AddVehicleForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [formData, setFormData] = useState({
    type: 'box_truck',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    vin: '',
    license_plate: '',
    gvwr: '',
    max_payload: '',
  });

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/api/v1/carrier/vehicles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carrier-vehicles'] });
      toast.success('Vehicle added');
      onClose();
    },
  });

  const inputCls = 'w-full bg-[var(--color-cream)] border border-[var(--color-cream-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-colors';

  return (
    <div className="bg-[var(--color-white)] border border-[var(--color-cream-dark)] rounded-lg p-6 space-y-4">
      <h4 className="font-semibold text-[var(--color-text)]">Add New Vehicle</h4>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className={inputCls}
          >
            <option value="box_truck">Box Truck</option>
            <option value="flatbed">Flatbed</option>
            <option value="enclosed_trailer">Enclosed Trailer</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="pickup_with_trailer">Pickup with Trailer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">Year</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">Make</label>
          <input
            type="text"
            placeholder="Freightliner"
            value={formData.make}
            onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">Model</label>
          <input
            type="text"
            placeholder="Cascadia"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">VIN</label>
          <input
            type="text"
            value={formData.vin}
            onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">License Plate</label>
          <input
            type="text"
            value={formData.license_plate}
            onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">GVWR (lbs)</label>
          <input
            type="number"
            value={formData.gvwr}
            onChange={(e) => setFormData(prev => ({ ...prev, gvwr: e.target.value }))}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-faint)] mb-1">Max Payload (lbs)</label>
          <input
            type="number"
            value={formData.max_payload}
            onChange={(e) => setFormData(prev => ({ ...prev, max_payload: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => addMutation.mutate(formData as any)}
          disabled={addMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-teal)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-teal-light)] disabled:opacity-60 transition-colors"
        >
          {addMutation.isPending && <Loader2 size={14} className="animate-spin" />}
          Add Vehicle
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-[var(--color-cream-dark)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-teal)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
