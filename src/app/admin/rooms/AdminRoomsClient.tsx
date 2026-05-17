'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Plus, X, Loader2, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Room } from '@/types';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.enum(['Private Room', '2 Bed Room', '3 Bed Room']),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.coerce.number().min(1, 'Price is required'),
  total_beds: z.coerce.number().min(1).max(10),
  facilities: z.string(),
  floor: z.coerce.number().min(1).max(20),
  availability_status: z.enum(['available', 'full', 'maintenance']),
});

type FormData = z.infer<typeof schema>;

interface Props { rooms: Room[] }

export default function AdminRoomsClient({ rooms: initial }: Props) {
  const [rooms, setRooms] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { availability_status: 'available', total_beds: 1, floor: 1 },
  });

  const openAdd = () => {
    setEditRoom(null);
    reset({ availability_status: 'available', total_beds: 1, floor: 1, category: 'Private Room' });
    setShowForm(true);
  };

  const openEdit = (room: Room) => {
    setEditRoom(room);
    setValue('title', room.title);
    setValue('category', room.category);
    setValue('description', room.description);
    setValue('price', room.price);
    setValue('total_beds', room.total_beds);
    setValue('floor', room.floor);
    setValue('availability_status', room.availability_status);
    setValue('facilities', room.facilities?.join(', ') || '');
    setShowForm(true);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        ...data,
        facilities: data.facilities.split(',').map(f => f.trim()).filter(Boolean),
      };

      if (editRoom) {
        const { data: updated, error } = await supabase.from('rooms').update(payload).eq('id', editRoom.id).select().single();
        if (error) throw error;
        setRooms(rooms.map(r => r.id === editRoom.id ? updated : r));
        toast.success('Room updated!');
      } else {
        const { data: newRoom, error } = await supabase.from('rooms').insert({ ...payload, occupied_beds: 0 }).select().single();
        if (error) throw error;
        setRooms([newRoom, ...rooms]);
        toast.success('Room added!');
      }
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      setRooms(rooms.filter(r => r.id !== id));
      toast.success('Room deleted!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white">{editRoom ? 'Edit Room' : 'Add New Room'}</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit as any)} className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                  <input {...register('title')} placeholder="Room title" className="hms-input" />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select {...register('category')} className="hms-input">
                    <option value="Private Room">Private Room</option>
                    <option value="2 Bed Room">2 Bed Room</option>
                    <option value="3 Bed Room">3 Bed Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Price (PKR/month)</label>
                  <input {...register('price')} type="number" placeholder="10000" className="hms-input" />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Total Beds</label>
                  <input {...register('total_beds')} type="number" min={1} max={10} className="hms-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Floor</label>
                  <input {...register('floor')} type="number" min={1} className="hms-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select {...register('availability_status')} className="hms-input">
                    <option value="available">Available</option>
                    <option value="full">Full</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Facilities (comma separated)</label>
                  <input {...register('facilities')} placeholder="WiFi, AC, Study Desk..." className="hms-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <textarea {...register('description')} rows={3} placeholder="Room description..." className="hms-input resize-none" />
                  {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editRoom ? 'Update Room' : 'Add Room'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-6 py-2.5">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <BedDouble className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No Rooms Added</h3>
          <p className="text-slate-400 text-sm mb-4">Start by adding your first room.</p>
          <button onClick={openAdd} className="btn-primary">Add First Room</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{room.title}</h3>
                  <p className="text-xs text-blue-400 mt-0.5">{room.category}</p>
                </div>
                <span className={`badge ${getStatusColor(room.availability_status)}`}>{getStatusLabel(room.availability_status)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="text-slate-400">Price <span className="text-white font-medium">{formatCurrency(room.price)}</span></div>
                <div className="text-slate-400">Floor <span className="text-white font-medium">{room.floor}</span></div>
                <div className="text-slate-400">Beds <span className="text-white font-medium">{room.occupied_beds}/{room.total_beds}</span></div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${Math.min((room.occupied_beds / room.total_beds) * 100, 100)}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(room)} className="btn-ghost flex-1 text-sm py-2 flex items-center justify-center gap-1">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  disabled={deleteId === room.id}
                  className="flex items-center justify-center gap-1 flex-1 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  {deleteId === room.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
