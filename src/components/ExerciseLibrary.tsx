
import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { fetchExercises } from '../services/exerciseService';
import { Search, PlayCircle, X, Dumbbell, Zap, Activity, Info, CheckCircle2, Wind, Heart, Loader2, ExternalLink } from 'lucide-react';

const PT_RED = "#C63527";

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchExercises(50); // Fetch 50 items if using API
      setExercises(data);
      setLoading(false);
    };
    load();
  }, []);

  // Dynamically extract categories from the dataset
  const dynamicCategories = Array.from(new Set(exercises.map(ex => ex.category))).sort();
  const categories = ["All", ...dynamicCategories];

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2
            className="text-2xl font-extrabold tracking-tight mb-1"
            style={{ color: PT_RED }}
          >
            Exercise Library
          </h2>
          <p className="text-sm text-gray-500">
            Comprehensive database of drills. Sourced from <span className="font-semibold">ExerciseDB</span> and internal assets.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search exercises..." 
                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer max-w-[150px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>

      {/* External Resources Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 custom-scrollbar">
          <a href="https://musclewiki.com/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors whitespace-nowrap">
              MuscleWiki <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://exrx.net/Lists/Directory" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors whitespace-nowrap">
              ExRx Database <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://www.catalystathletics.com/exercises/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors whitespace-nowrap">
              Catalyst Athletics <ExternalLink className="w-3 h-3" />
          </a>
      </div>

      {loading && (
          <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm">Loading exercises...</span>
          </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredExercises.map(ex => (
                <div 
                    key={ex.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
                    onClick={() => setSelectedExercise(ex)}
                >
                    {/* Thumbnail: Uses GIF if API data, or Icon Placeholder if local */}
                    <div className="h-40 bg-gray-50 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                        {ex.gifUrl ? (
                            <img 
                                src={ex.gifUrl} 
                                alt={ex.name} 
                                className="w-full h-full object-cover mix-blend-multiply" 
                                loading="lazy"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                {ex.category === "Strength" && <Dumbbell className="w-10 h-10 text-blue-200" />}
                                {ex.category === "Power" && <Zap className="w-10 h-10 text-yellow-200" />}
                                {ex.category === "Plyometric" && <Activity className="w-10 h-10 text-orange-200" />}
                                {ex.category === "Mobility" && <Info className="w-10 h-10 text-green-200" />}
                                {ex.category === "Speed" && <Wind className="w-10 h-10 text-indigo-200" />}
                                {ex.category === "Core" && <Heart className="w-10 h-10 text-red-200" />}
                            </div>
                        )}

                        {/* Play Icon Overlay (only for Video items) */}
                        {ex.videoUrl && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 duration-300">
                                <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                            </div>
                        )}
                        
                        {/* Category Tag Overlay */}
                        <div className="absolute top-2 left-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm
                                ${ex.category === "Strength" ? "bg-blue-600 text-white" : 
                                ex.category === "Power" ? "bg-yellow-500 text-white" :
                                ex.category === "Plyometric" ? "bg-orange-500 text-white" : 
                                ex.category === "Speed" ? "bg-indigo-500 text-white" :
                                ex.category === "Core" ? "bg-red-500 text-white" :
                                ex.category === "Mobility" ? "bg-green-600 text-white" :
                                "bg-gray-700 text-white"}`} // Fallback color for API categories
                            >
                                {ex.category}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight group-hover:text-red-700 transition-colors capitalize">{ex.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-medium capitalize">
                                {ex.equipment}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-auto capitalize">
                            {ex.primaryMuscles.join(", ")}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      )}

      {!loading && filteredExercises.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No exercises found matching your search.</p>
              <button 
                  onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                  className="mt-2 text-sm text-red-600 font-bold hover:underline"
              >
                  Clear Filters
              </button>
          </div>
      )}

      {/* Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                
                {/* Close Button Mobile */}
                <button 
                    onClick={() => setSelectedExercise(null)}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white md:hidden"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Media Container: Handles both YouTube and GIFs */}
                <div className="w-full md:w-2/3 bg-gray-100 relative aspect-video md:aspect-auto flex items-center justify-center">
                    {selectedExercise.videoUrl ? (
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`${selectedExercise.videoUrl}?autoplay=0&rel=0&modestbranding=1`} 
                            title={selectedExercise.name}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : selectedExercise.gifUrl ? (
                        <img 
                            src={selectedExercise.gifUrl} 
                            alt={selectedExercise.name}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Dumbbell className="w-12 h-12 mb-2" />
                            <span className="text-sm">No video preview available</span>
                        </div>
                    )}
                </div>
                
                <div className="w-full md:w-1/3 bg-white flex flex-col h-full max-h-[50vh] md:max-h-full">
                    <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50">
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900 leading-tight capitalize">{selectedExercise.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600 uppercase">
                                    {selectedExercise.category}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600 uppercase">
                                    {selectedExercise.equipment}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedExercise(null)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors hidden md:block"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                        {/* Fallback link if video fails or for external reference */}
                        {selectedExercise.videoUrl && (
                            <a 
                                href={selectedExercise.videoUrl.replace("embed/", "watch?v=")} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                            >
                                <PlayCircle className="w-3 h-3" /> Watch on YouTube
                            </a>
                        )}

                        <div>
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> Key Coaching Cues
                            </h4>
                            <ul className="space-y-3">
                                {selectedExercise.cues.map((cue, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">
                                            {idx + 1}
                                        </span>
                                        <span className="mt-0.5 capitalize">{cue}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Target Muscles</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedExercise.primaryMuscles.map(m => (
                                    <span key={m} className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-medium text-blue-700 capitalize">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
