import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Bot, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import { donationAPI, aiAPI } from '../../services/api';

const schema = z.object({
  food_name: z.string().min(2, 'Food name required'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity required'),
  servings: z.string().min(1, 'Servings required'),
  food_type: z.enum(['vegetarian', 'non-vegetarian', 'vegan', 'mixed'], { message: 'Select food type' }),
  cooked_time: z.string().min(1, 'Cooked time required'),
  expiry_time: z.string().min(1, 'Expiry time required'),
  pickup_address: z.string().min(5, 'Pickup address required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateDonation() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [shelfLife, setShelfLife] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generateAI = async () => {
    const values = watch();
    if (!values.food_name) return;
    setAiLoading(true);
    try {
      const [descRes, shelfRes] = await Promise.all([
        aiAPI.generateDescription(values),
        aiAPI.generateShelfLife(values),
      ]);
      setAiDescription(descRes.data.description);
      setShelfLife(shelfRes.data.guidance);
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      let imageUrl = '';
      if (imageFile) {
        const uploadRes = await donationAPI.uploadImage(imageFile);
        imageUrl = uploadRes.data.url;
      }
      const formattedData = {
        ...data,
        cooked_time: data.cooked_time ? new Date(data.cooked_time).toISOString() : new Date().toISOString(),
        expiry_time: data.expiry_time ? new Date(data.expiry_time).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        image_url: imageUrl || undefined
      };
      await donationAPI.create(formattedData);
      setSuccess(true);
      setTimeout(() => navigate('/restaurant/history'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create donation');
    }
  };

  if (success) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-center">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Donation Created!</h2>
            <p className="text-slate-400">AI is now finding the best NGO match. Redirecting...</p>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="New Food Donation" subtitle="Fill in the details below. Our AI will handle the rest.">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><span>🍽️</span> Food Details</h3>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Food Name *</label>
                <input {...register('food_name')} placeholder="e.g. Vegetable Biryani" className="input-dark" />
                {errors.food_name && <p className="text-red-400 text-xs mt-1">{errors.food_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Food Type *</label>
                <select {...register('food_type')} className="input-dark">
                  <option value="">Select type</option>
                  <option value="vegetarian">🥗 Vegetarian</option>
                  <option value="non-vegetarian">🍗 Non-Vegetarian</option>
                  <option value="vegan">🌿 Vegan</option>
                  <option value="mixed">🍱 Mixed</option>
                </select>
                {errors.food_type && <p className="text-red-400 text-xs mt-1">{errors.food_type.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity *</label>
                <input {...register('quantity')} placeholder="e.g. 5 kg, 20 boxes" className="input-dark" />
                {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">No. of Servings *</label>
                <input {...register('servings')} type="number" placeholder="e.g. 50" className="input-dark" />
                {errors.servings && <p className="text-red-400 text-xs mt-1">{errors.servings.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Cooked/Prepared At *</label>
                <input {...register('cooked_time')} type="datetime-local" className="input-dark" />
                {errors.cooked_time && <p className="text-red-400 text-xs mt-1">{errors.cooked_time.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiry Time *</label>
                <input {...register('expiry_time')} type="datetime-local" className="input-dark" />
                {errors.expiry_time && <p className="text-red-400 text-xs mt-1">{errors.expiry_time.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
              <textarea {...register('description')} rows={3} placeholder="Any additional details about the food..." className="input-dark resize-none" />
            </div>
          </div>

          {/* Location */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><span>📍</span> Pickup Location</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Pickup Address *</label>
              <input {...register('pickup_address')} placeholder="Full pickup address" className="input-dark" />
              {errors.pickup_address && <p className="text-red-400 text-xs mt-1">{errors.pickup_address.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Latitude (optional)</label>
                <input {...register('latitude')} type="number" step="any" placeholder="e.g. 12.9716" className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Longitude (optional)</label>
                <input {...register('longitude')} type="number" step="any" placeholder="e.g. 77.5946" className="input-dark" />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><span>📸</span> Food Photo (optional)</h3>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-green-500/30 transition-all">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-500 mb-2" />
                  <p className="text-slate-400 text-sm">Click to upload image</p>
                  <p className="text-slate-500 text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          {/* AI Features */}
          <div className="glass-card p-6 border-purple-500/20">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-purple-400" /> AI Assistance
            </h3>
            <Button type="button" variant="secondary" onClick={generateAI} loading={aiLoading} className="mb-4">
              <Sparkles className="w-4 h-4" /> Generate AI Description & Shelf-Life Guidance
            </Button>
            {aiDescription && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">AI Food Description</p>
                  <p className="text-slate-300 text-sm">{aiDescription}</p>
                </div>
                {shelfLife && (
                  <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">⚠️ Shelf-Life Guidance (Estimate Only — Not a Food Safety Certification)</p>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{shelfLife}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
            🍽️ Submit Donation
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
