import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { Devotion, ChurchEvent, Announcement, StudyText } from '../../types';
import {
  HeartHandshake,
  Calendar,
  Bell,
  BookOpen,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const StudentCommunityView: React.FC<{ initialSection?: 'devocionais' | 'eventos' | 'avisos' | 'textos' }> = ({
  initialSection = 'devocionais',
}) => {
  const { studentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'devocionais' | 'eventos' | 'avisos' | 'textos'>(initialSection);

  const courseType = studentProfile?.courseType || 'confirmatorio';
  const congregationId = studentProfile?.congregationId;

  const devotions = dbService.getDevotions(courseType);
  const events = dbService.getEvents(congregationId);
  const announcements = dbService.getAnnouncements(courseType);
  const studyTexts = dbService.getStudyTexts();

  return (
    <div className="space-y-6 pb-12">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-2">
        <button
          onClick={() => setActiveTab('devocionais')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'devocionais'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Devoções Diárias</span>
        </button>

        <button
          onClick={() => setActiveTab('eventos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'eventos'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Eventos da Igreja</span>
        </button>

        <button
          onClick={() => setActiveTab('avisos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'avisos'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos Paroquiais</span>
        </button>

        <button
          onClick={() => setActiveTab('textos')}
          className={`pb-2.5 px-3 font-bold text-xs whitespace-nowrap transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'textos'
              ? 'border-amber-700 text-amber-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Textos e Estudos</span>
        </button>
      </div>

      {/* DEVOTIONS */}
      {activeTab === 'devocionais' && (
        <div className="space-y-4">
          {devotions.map((dev) => (
            <div
              key={dev.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Devoção do Dia • {dev.date}
                </span>
                <span className="text-xs text-slate-400">Pastor Everton Figur</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 font-display">{dev.title}</h3>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs font-serif text-amber-950 italic">
                {dev.verse}
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <p>{dev.content}</p>
              </div>

              {dev.prayer && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                  <span className="font-bold block text-slate-900">Oração:</span>
                  <p className="italic">“{dev.prayer}”</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EVENTS */}
      {activeTab === 'eventos' && (
        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px] uppercase tracking-wider">
                  {evt.date} às {evt.time}
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-display">{evt.title}</h4>
                <p className="text-xs text-slate-600">{evt.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{evt.location}</span>
                </div>
              </div>

              <div className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 self-end sm:self-center">
                Presença Recomendada
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ANNOUNCEMENTS */}
      {activeTab === 'avisos' && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 font-display">{ann.title}</h4>
                <span className="text-[11px] text-slate-400">{ann.date}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
              <p className="text-[10px] text-amber-700 font-bold">
                Publicado por: {ann.author}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* STUDY TEXTS */}
      {activeTab === 'textos' && (
        <div className="space-y-3">
          {studyTexts.map((text) => (
            <div
              key={text.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {text.category}
                </span>
                <span className="text-[11px] text-slate-400">{text.date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-display">{text.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{text.content}</p>
              <p className="text-[10px] text-slate-500 italic">Autor: {text.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
