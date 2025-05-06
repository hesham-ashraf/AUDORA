import React from 'react';

const AlbumCard = ({ title, artist, image, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-dark-200 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer group relative border border-white/10"
    >
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6.5 5.5a.5.5 0 01.832-.374l5 4.5a.5.5 0 010 .748l-5 4.5A.5.5 0 016.5 14.5v-9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate text-white">{title}</h3>
        <p className="text-sm text-gray-400">{artist}</p>
      </div>
    </div>
  );
};

export default AlbumCard;