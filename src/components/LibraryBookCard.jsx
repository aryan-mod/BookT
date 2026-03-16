import React, { useEffect, useRef, useState } from 'react';
import { Star, Clock, BookOpen, MoreHorizontal, Edit, Play, ExternalLink, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  reading:   'status-reading',
  completed: 'status-completed',
  wishlist:  'status-wishlist',
};

const STATUS_DOT = {
  reading: 'bg-cyan-400 animate-pulse',
  completed: 'bg-emerald-400',
  wishlist: 'bg-amber-400',
};

const GENRE_COLORS = ['from-violet-500/20 to-violet-600/10', 'from-cyan-500/20 to-cyan-600/10', 'from-amber-500/20 to-amber-600/10', 'from-emerald-500/20 to-emerald-600/10', 'from-pink-500/20 to-pink-600/10'];

const LibraryBookCard = ({ book, onBookClick, onBookEdit, onReactionClick, onProgressUpdate, onReadUploaded }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(book?.currentPage || 0);
  const [coverSrcIndex, setCoverSrcIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const coverSources = (() => {
    const sources = [];
    const push = (v) => { if (typeof v === 'string' && v.trim() && !sources.includes(v.trim())) sources.push(v.trim()); };
    push(book?.thumbnail); push(book?.cover); push(book?.coverImage);
    push(book?.googleThumbnail); push(book?.imageLinks?.thumbnail);
    const coverId = book?.openLibraryCoverId ?? book?.coverId ?? book?.cover_i ?? null;
    if (coverId != null) push(`https://covers.openlibrary.org/b/id/${String(coverId).trim()}-M.jpg`);
    return sources;
  })();

  const coverSrc = coverSrcIndex < coverSources.length ? coverSources[coverSrcIndex] : null;
  const showResume = book?.type === 'uploaded' && Number(book?.currentPage) > 1;
  const showPreview = typeof book?.previewLink === 'string' && book.previewLink.trim().length > 0;
  const progress = book?.status === 'completed' ? 100 : (book?.currentPage && book?.pages ? Math.round((book.currentPage / book.pages) * 100) : 0);
  const statusClass = STATUS_STYLES[book?.status] || 'status-default';
  const statusDot = STATUS_DOT[book?.status] || 'bg-slate-400';
  const genreColor = GENRE_COLORS[Math.abs((book?.title || '').charCodeAt(0) % GENRE_COLORS.length)];

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -12;
    const rotateY = (x - 0.5) * 12;
    setTilt({ x: rotateX, y: rotateY });
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowMenu(false);
    setTilt({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
  };

  const handleProgressChange = (e) => {
    e.stopPropagation();
    const newPage = parseInt(e.target.value, 10);
    setCurrentPage(newPage);
    if (book && typeof onProgressUpdate === 'function') onProgressUpdate(book.id || book._id, newPage);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => typeof onBookClick === 'function' && onBookClick(book)}
      className="relative rounded-2xl overflow-hidden cursor-pointer animate-slide-in-up"
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)` : 'perspective(1000px) rotateX(0) rotateY(0)',
        transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.3s ease' : 'transform 0.4s ease-out, box-shadow 0.4s ease',
        boxShadow: isHovered ? '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(124,58,237,0.2)' : '0 4px 20px rgba(0,0,0,0.5)',
        background: 'rgba(15,15,26,0.9)',
        border: `1px solid ${isHovered ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
        willChange: 'transform',
      }}
    >
      {/* Mouse glow follower */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(200px circle at ${glowPos.x}% ${glowPos.y}%, rgba(124,58,237,0.12), transparent 70%)`,
          }}
        />
      )}

      {/* Cover area */}
      <div className="relative h-52 overflow-hidden">
        {/* Genre gradient header */}
        <div className={`absolute inset-0 bg-gradient-to-br ${genreColor} opacity-60`} />

        {coverSrc ? (
          <img
            src={coverSrc}
            alt={book?.title || 'Book cover'}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.06)' : 'scale(1)' }}
            onError={() => setCoverSrcIndex(i => Math.min(i + 1, coverSources.length))}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
            <BookOpen className="h-10 w-10" />
            <span className="text-xs font-medium">No cover</span>
          </div>
        )}

        {/* Status chip */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${statusClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {book?.status || 'added'}
          </span>
        </div>

        {/* Menu button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            className="p-1.5 rounded-xl bg-black/40 backdrop-blur hover:bg-black/60 transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          >
            <MoreHorizontal className="h-4 w-4 text-white/80" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 glass rounded-xl shadow-2xl py-1 z-20 min-w-[120px] animate-fade-in">
              <button
                onClick={(e) => { e.stopPropagation(); typeof onBookEdit === 'function' && onBookEdit(book); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Edit className="h-3.5 w-3.5 text-violet-400" /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Progress overlay at bottom of cover */}
        {book?.status === 'reading' && book?.pages && book?.type !== 'uploaded' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-3 px-4">
            <div className="progress-bar mb-1">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white/80 text-xs">{progress}% complete</p>
          </div>
        )}

        {/* Hover quick-action toolbar */}
        <div className={`absolute inset-x-0 bottom-0 p-3 flex justify-center gap-2 transition-all duration-300 ${isHovered && book?.type !== 'reading' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {book?.type === 'uploaded' && (
            <>
              {showResume && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/reader/${book.id || book._id}?page=${book.currentPage || 1}`); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/90 backdrop-blur rounded-xl text-white text-xs font-semibold hover:bg-violet-600 transition-colors"
                >
                  <Play className="h-3 w-3" /> Resume
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); typeof onReadUploaded === 'function' && onReadUploaded(book); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur rounded-xl text-white text-xs font-semibold hover:bg-black/80 transition-colors border border-white/10"
              >
                <BookOpen className="h-3 w-3" /> Open
              </button>
            </>
          )}
          {showPreview && (
            <button
              onClick={(e) => { e.stopPropagation(); window.open(book.previewLink, '_blank', 'noopener,noreferrer'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur rounded-xl text-white text-xs font-semibold hover:bg-black/80 transition-colors border border-white/10"
            >
              <ExternalLink className="h-3 w-3" /> Preview
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative z-10 flex flex-col h-[180px]">
        <div className="flex items-start justify-between mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-[15px] leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
              {book?.title || 'Untitled'}
            </h3>
            {book?.author && <p className="text-slate-400 text-xs mt-1 truncate">by {book.author}</p>}
          </div>
          {book?.rating > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg flex-shrink-0 border border-amber-500/20">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{book.rating}</span>
            </div>
          )}
        </div>

        {/* Genre tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(Array.isArray(book?.genre) ? book.genre : Array.isArray(book?.categories) ? book.categories : []).slice(0, 2).map((g, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-white/5 border border-white/10 text-slate-300">{g}</span>
          ))}
        </div>

        <div className="mt-auto">
          {/* Meta row */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
             {book?.pages ? (
               <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-violet-400" /> {book.pages}</span>
             ) : (
                <span className="flex items-center gap-1.5 opacity-50"><BookOpen className="h-3 w-3" /> --</span>
             )}
             {book?.startDate ? (
               <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-cyan-400" /> {new Date(book.startDate).toLocaleDateString('en', { month: 'short', year: '2-digit' })}</span>
             ) : (
                <span className="flex items-center gap-1.5 opacity-50"><Clock className="h-3 w-3" /> --</span>
             )}
             {book?.type === 'uploaded' && (
               <span className="flex items-center gap-1.5 text-emerald-400 ml-auto bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"><Zap className="h-3 w-3" /> PDF</span>
             )}
          </div>

          {/* Progress slider */}
          {(book?.status === 'reading' && book?.pages && book?.type !== 'uploaded') ? (
            <div className="mb-2">
              <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
                <span>Progress</span>
                <span className="text-violet-400">{currentPage} / {book.pages}</span>
              </div>
              <input
                type="range" min="0" max={book.pages} value={currentPage}
                onChange={handleProgressChange}
                onClick={(e) => e.stopPropagation()}
                className="w-full slider h-1.5"
              />
            </div>
          ) : null}

          {/* Reactions */}
          {book?.reactions && Object.keys(book.reactions).length > 0 && (
            <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/5">
              {Object.entries(book.reactions).slice(0, 4).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={(e) => { e.stopPropagation(); typeof onReactionClick === 'function' && onReactionClick(book.id || book._id, emoji); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-violet-500/20 border border-transparent hover:border-violet-500/30 transition-colors text-xs"
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-slate-400 font-medium">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryBookCard;
