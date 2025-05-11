import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Trash2, Play, XCircle } from "lucide-react";

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);

  // Load downloads from localStorage every time the page is shown
  useEffect(() => {
    const stored = localStorage.getItem("audora_downloads");
    setDownloads(stored ? JSON.parse(stored) : []);
  }, []);

  const handlePlay = (track) => {
    // Implement play logic or navigation to player with this track
    console.log("Play track:", track);
  };

  const handleRemove = (id) => {
    const updated = downloads.filter((item) => item.id !== id);
    setDownloads(updated);
    localStorage.setItem("audora_downloads", JSON.stringify(updated));
  };

  const handleClear = () => {
    setDownloads([]);
    localStorage.removeItem("audora_downloads");
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          {downloads.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              <Trash2 size={18} /> Clear All
            </button>
          )}
        </div>
        {downloads.length === 0 ? (
          <div className="text-gray-400 text-center mt-20 text-lg">
            You have no downloads yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((track) => (
              <div
                key={track.id}
                className="bg-neutral-900 rounded-lg shadow p-4 flex items-center gap-4 relative"
              >
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-16 h-16 object-cover rounded shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{track.title}</div>
                  <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                </div>
                <button
                  onClick={() => handlePlay(track)}
                  className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                  title="Play"
                >
                  <Play size={18} />
                </button>
                <button
                  onClick={() => handleRemove(track.id)}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition ml-2"
                  title="Remove"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Downloads; 