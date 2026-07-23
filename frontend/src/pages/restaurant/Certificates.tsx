import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { certificateAPI } from '../../services/api';
import { Certificate } from '../../types';
import { formatDateTime } from '../../lib/utils';

export default function Certificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateAPI.getAll()
      .then(res => setCerts(res.data.certificates || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout title="Donation Certificates" subtitle="Download your official food donation certificates.">
      {loading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="glass-card h-24 animate-pulse" />)}</div>
      ) : certs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No certificates yet. Complete a donation to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {certs.map((cert, idx) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{cert.donation?.food_name || 'Donation Certificate'}</h3>
                  <p className="text-slate-400 text-sm">Certificate #{cert.certificate_number}</p>
                  <p className="text-slate-500 text-xs mt-1">{formatDateTime(cert.issued_at)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {cert.pdf_url && (
                  <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all">
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
