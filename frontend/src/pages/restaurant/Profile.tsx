import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import { restaurantAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Restaurant name required'),
  owner_name: z.string().min(2, 'Owner name required'),
  phone: z.string().min(10, 'Valid phone required'),
  address: z.string().min(5, 'Address required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RestaurantProfile() {
  const { profile, refreshProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        owner_name: profile.owner_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        latitude: profile.latitude?.toString() || '',
        longitude: profile.longitude?.toString() || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await restaurantAPI.updateProfile(data);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    }
  };

  return (
    <PageLayout title="Restaurant Profile" subtitle="Keep your profile up to date for better NGO matching.">
      <div className="max-w-2xl mx-auto">
        {saved && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Profile saved successfully!
          </motion.div>
        )}
        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Restaurant Name *</label>
              <input {...register('name')} className="input-dark" placeholder="Your restaurant name" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Owner Name *</label>
              <input {...register('owner_name')} className="input-dark" placeholder="Owner full name" />
              {errors.owner_name && <p className="text-red-400 text-xs mt-1">{errors.owner_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone *</label>
              <input {...register('phone')} className="input-dark" placeholder="+91 XXXXX XXXXX" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Address *</label>
              <input {...register('address')} className="input-dark" placeholder="Restaurant address" />
              {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Latitude</label>
              <input {...register('latitude')} type="number" step="any" className="input-dark" placeholder="e.g. 12.9716" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Longitude</label>
              <input {...register('longitude')} type="number" step="any" className="input-dark" placeholder="e.g. 77.5946" />
            </div>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">Save Profile</Button>
        </form>
      </div>
    </PageLayout>
  );
}
