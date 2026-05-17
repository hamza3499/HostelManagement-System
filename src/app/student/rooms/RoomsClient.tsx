'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, BedDouble, Wifi, Wind, CheckCircle, XCircle } from 'lucide-react';
import type { Room, RoomCategory, AvailabilityStatus } from '@/types';
import { formatCurrency, getStatusColor, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

interface Props { rooms: Room[] }

const categories: RoomCategory[] = ['Private Room', '2 Bed Room', '3 Bed Room'];

export default function RoomsClient({ rooms }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<RoomCategory | ''>('');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [availability, setAvailability] = useState<AvailabilityStatus | ''>('');
  const [floor, setFloor] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = rooms.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && r.category !== category) return false;
    if (r.price > maxPrice) return false;
    
    if (availability) {
      const isRoomAvailable = r.availability_status === 'available' && r.occupied_beds < r.total_beds;
      if (availability === 'available' && !isRoomAvailable) return false;
      if (availability === 'full' && isRoomAvailable) return false;
      if (availability === 'maintenance' && r.availability_status !== 'maintenance') return false;
    }
    
    if (floor !== '' && r.floor !== floor) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="hms-input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-ghost flex items-center gap-2 ${showFilters ? 'border-blue-500/50 text-blue-400' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(category || availability || floor !== '') && (
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RoomCategory | '')}
                  className="hms-input"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Max Price */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">
                  Max Price: {formatCurrency(maxPrice)}
                </label>
                <input
                  type="range"
                  min={3000}
                  max={20000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              {/* Availability */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityStatus | '')}
                  className="hms-input"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              {/* Floor */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">Floor</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value === '' ? '' : Number(e.target.value))}
                  className="hms-input"
                >
                  <option value="">All Floors</option>
                  {[1, 2, 3, 4, 5].map((f) => <option key={f} value={f}>Floor {f}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Showing <span className="text-white font-medium">{filtered.length}</span> rooms
      </div>

      {/* Room Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <BedDouble className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No rooms found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RoomCard room={room} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  const isAvailable = room.availability_status === 'available' && room.occupied_beds < room.total_beds;
  const occupancyPct = room.total_beds > 0 ? (room.occupied_beds / room.total_beds) * 100 : 0;

  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden flex flex-col">
      {/* Image / placeholder */}
      <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-900 relative flex-shrink-0">
        {room.images && room.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BedDouble className="w-12 h-12 text-slate-600" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 right-3 badge ${getStatusColor(room.availability_status)}`}>
          {isAvailable ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
          {getStatusLabel(room.availability_status)}
        </span>
        {/* Floor badge */}
        <span className="absolute top-3 left-3 badge bg-black/40 text-white border-white/20 text-xs">
          Floor {room.floor}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-white text-sm">{room.title}</h3>
            <span className="text-xs text-blue-400">{room.category}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-white text-sm">{formatCurrency(room.price)}</div>
            <div className="text-xs text-slate-400">/month</div>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4">{room.description}</p>

        {/* Occupancy */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Occupancy</span>
            <span className="text-slate-300">{room.occupied_beds}/{room.total_beds} beds</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${occupancyPct >= 100 ? 'bg-red-500' : occupancyPct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {room.facilities?.slice(0, 4).map((f) => (
            <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1">
              {f === 'WiFi' ? <Wifi className="w-3 h-3" /> : f === 'AC' ? <Wind className="w-3 h-3" /> : null}
              {f}
            </span>
          ))}
          {(room.facilities?.length || 0) > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">+{room.facilities.length - 4}</span>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <Link href={`/student/rooms/${room.id}`} className="btn-ghost flex-1 text-center text-sm py-2 inline-flex justify-center">
            View Details
          </Link>
          {isAvailable && (
            <Link href={`/student/rooms/${room.id}#book`} className="btn-primary flex-1 text-center text-sm py-2 inline-flex justify-center">
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
