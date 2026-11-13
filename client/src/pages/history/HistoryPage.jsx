import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cropService } from '../../services/cropService';
import { diseaseService } from '../../services/diseaseService';
import { fertilizerService } from '../../services/fertilizerService';
import { irrigationService } from '../../services/irrigationService';
import { PageContainer } from '../../components/common/PageContainer';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  History,
  Sprout,
  ScanSearch,
  Beaker,
  Droplets,
  Search,
  Trash2,
  ExternalLink,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [crops, setCrops] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [irrigations, setIrrigations] = useState([]);

  const loadAllHistory = async () => {
    try {
      setLoading(true);
      const [c, d, f, i] = await Promise.all([
        cropService.getRecommendations().catch(() => []),
        diseaseService.getHistory().catch(() => []),
        fertilizerService.getHistory().catch(() => []),
        irrigationService.getHistory().catch(() => [])
      ]);
      setCrops(c || []);
      setDiseases(d || []);
      setFertilizers(f || []);
      setIrrigations(i || []);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllHistory();
  }, []);

  const handleDeleteItem = async (category, id) => {
    if (!window.confirm('Are you sure you want to delete this advisory record?')) return;

    try {
      if (category === 'crop') {
        await cropService.deleteRecommendation(id);
        setCrops(prev => prev.filter(x => x.id !== id));
      } else if (category === 'disease') {
        await diseaseService.deleteReport(id);
        setDiseases(prev => prev.filter(x => x.id !== id));
      } else if (category === 'fertilizer') {
        await fertilizerService.deleteReport(id);
        setFertilizers(prev => prev.filter(x => x.id !== id));
      } else if (category === 'irrigation') {
        await irrigationService.deleteReport(id);
        setIrrigations(prev => prev.filter(x => x.id !== id));
      }
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  // Compile combined list
  const compiledItems = [
    ...crops.map(c => ({
      id: c.id,
      category: 'crop',
      title: `Crop Advisory: ${c.input_data?.district}, ${c.input_data?.state} (${c.input_data?.season})`,
      subtitle: `${c.recommendations?.recommendations?.length || 0} crops ranked • Soil: ${c.input_data?.soil_type}`,
      status: 'completed',
      created_at: c.created_at,
      link: `/crop-recommendation/results/${c.id}`
    })),
    ...diseases.map(d => ({
      id: d.id,
      category: 'disease',
      title: `Plant Pathology: ${d.crop_name}`,
      subtitle: d.analysis?.primary_finding || d.symptoms,
      status: d.analysis?.health_status || 'analyzed',
      created_at: d.created_at,
      link: `/disease-detection/results/${d.id}`,
      image: d.image_path
    })),
    ...fertilizers.map(f => ({
      id: f.id,
      category: 'fertilizer',
      title: `Nutrient Advisory: ${f.crop_name}`,
      subtitle: `${f.input_data?.growth_stage} • ${f.input_data?.soil_type}`,
      status: 'completed',
      created_at: f.created_at,
      advisory: f.advisory
    })),
    ...irrigations.map(ir => ({
      id: ir.id,
      category: 'irrigation',
      title: `Irrigation Advisory: ${ir.crop_name}`,
      subtitle: `${ir.input_data?.irrigation_method} • Risk: ${ir.advisory?.water_stress_risk}`,
      status: ir.advisory?.water_stress_risk || 'completed',
      created_at: ir.created_at,
      advisory: ir.advisory
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Filter by active tab & search query
  const filteredItems = compiledItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'crop': return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'disease': return <ScanSearch className="w-4 h-4 text-amber-600" />;
      case 'fertilizer': return <Beaker className="w-4 h-4 text-teal-600" />;
      case 'irrigation': return <Droplets className="w-4 h-4 text-cyan-600" />;
      default: return <History className="w-4 h-4 text-agri-600" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Saved Agricultural Advisory Records"
        subtitle="Review, audit, or delete previously generated crop selections, plant scans, and nutrient schedules"
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-agri-100 text-agri-900 border border-agri-200">
            <History className="w-3.5 h-3.5 text-agri-700" />
            {compiledItems.length} Total Records
          </span>
        }
      />

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-surface-border shadow-xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Advisories' },
              { id: 'crop', label: 'Crops' },
              { id: 'disease', label: 'Disease Scans' },
              { id: 'fertilizer', label: 'Fertilizer' },
              { id: 'irrigation', label: 'Irrigation' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-agri-700 text-white shadow-xs'
                    : 'bg-surface-bg text-text-muted hover:text-text-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-surface-border focus:border-agri-600 focus:ring-1 focus:ring-agri-600 outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading historical agricultural records..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No advisory records match your filter"
          description="Try selecting another category tab or generate a new crop recommendation."
          actionText="New Crop Advisory"
          onAction={() => window.location.href = '/crop-recommendation'}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-surface-border shadow-xs divide-y divide-surface-border overflow-hidden">
          {filteredItems.map((item) => (
            <div
              key={`${item.category}-${item.id}`}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/60 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-bg border border-surface-border flex items-center justify-center shrink-0">
                  {getCategoryIcon(item.category)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-text-main">{item.title}</h3>
                    <StatusBadge status={item.status} text={item.status} />
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border/60">
                <div className="flex items-center gap-1.5 text-[11px] text-text-light">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  {item.link ? (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-agri-700 bg-agri-50 hover:bg-agri-100 rounded-lg transition-colors"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-text-muted italic px-2">Archived</span>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item.category, item.id)}
                    className="p-1.5 text-text-light hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
