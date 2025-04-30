import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layout/MainLayout';

const AdminUpload = () => {
  const [activeTab, setActiveTab] = useState('album');

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-md">
        <h2 className="text-2xl font-bold mb-4">Admin Upload Panel</h2>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab('album')} className={`px-4 py-2 rounded-md ${activeTab === 'album' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Album</button>
          <button onClick={() => setActiveTab('podcast')} className={`px-4 py-2 rounded-md ${activeTab === 'podcast' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Podcast</button>
          <button onClick={() => setActiveTab('playlist')} className={`px-4 py-2 rounded-md ${activeTab === 'playlist' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Playlist</button>
        </div>

        {activeTab === 'album' && <AlbumForm />}
        {activeTab === 'podcast' && <PodcastForm />}
        {activeTab === 'playlist' && <PlaylistForm />}
      </div>
    </MainLayout>
  );
};

const AlbumForm = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tracks, setTracks] = useState([{ title: '', audioUrl: '' }]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTrackChange = (index, field, value) => {
    const newTracks = [...tracks];
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  const addTrack = () => setTracks([...tracks, { title: '', audioUrl: '' }]);
  const removeTrack = (index) => setTracks(tracks.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/albums', { title, artist, coverUrl, tracks });
      setSuccess(true);
      setTitle(''); setArtist(''); setCoverUrl(''); setTracks([{ title: '', audioUrl: '' }]);
    } catch (err) {
      setError('Failed to upload album');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Album Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />
      <input type="text" placeholder="Artist Name" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />
      <input type="text" placeholder="Cover Image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />

      <h3 className="text-lg font-semibold mt-4">Tracks</h3>
      {tracks.map((track, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input type="text" placeholder="Track Title" value={track.title} onChange={(e) => handleTrackChange(index, 'title', e.target.value)} className="flex-1 border px-3 py-2 rounded-md" required />
          <input type="text" placeholder="Audio URL" value={track.audioUrl} onChange={(e) => handleTrackChange(index, 'audioUrl', e.target.value)} className="flex-1 border px-3 py-2 rounded-md" required />
          <button type="button" onClick={() => removeTrack(index)} className="bg-red-500 text-white px-3 rounded">X</button>
        </div>
      ))}
      <button type="button" onClick={addTrack} className="bg-blue-500 text-white px-4 py-2 rounded-md">+ Add Track</button>
      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md block mt-6">Upload Album</button>
      {success && <p className="text-green-600 mt-3">Album uploaded successfully!</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </form>
  );
};

const PodcastForm = () => {
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [episodes, setEpisodes] = useState([{ title: '', audioUrl: '' }]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleEpisodeChange = (index, field, value) => {
    const newEpisodes = [...episodes];
    newEpisodes[index][field] = value;
    setEpisodes(newEpisodes);
  };

  const addEpisode = () => setEpisodes([...episodes, { title: '', audioUrl: '' }]);
  const removeEpisode = (index) => setEpisodes(episodes.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/podcasts', { title, host, coverUrl, episodes });
      setSuccess(true);
      setTitle(''); setHost(''); setCoverUrl(''); setEpisodes([{ title: '', audioUrl: '' }]);
    } catch (err) {
      setError('Failed to upload podcast');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Podcast Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />
      <input type="text" placeholder="Host Name" value={host} onChange={(e) => setHost(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />
      <input type="text" placeholder="Cover Image URL" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />

      <h3 className="text-lg font-semibold mt-4">Episodes</h3>
      {episodes.map((ep, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input type="text" placeholder="Episode Title" value={ep.title} onChange={(e) => handleEpisodeChange(index, 'title', e.target.value)} className="flex-1 border px-3 py-2 rounded-md" required />
          <input type="text" placeholder="Audio URL" value={ep.audioUrl} onChange={(e) => handleEpisodeChange(index, 'audioUrl', e.target.value)} className="flex-1 border px-3 py-2 rounded-md" required />
          <button type="button" onClick={() => removeEpisode(index)} className="bg-red-500 text-white px-3 rounded">X</button>
        </div>
      ))}
      <button type="button" onClick={addEpisode} className="bg-blue-500 text-white px-4 py-2 rounded-md">+ Add Episode</button>
      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md block mt-6">Upload Podcast</button>
      {success && <p className="text-green-600 mt-3">Podcast uploaded successfully!</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </form>
  );
};

const PlaylistForm = () => {
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [trackIds, setTrackIds] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/tracks').then(res => setTracks(res.data));
    axios.get('http://localhost:5000/api/users').then(res => setUsers(res.data));
  }, []);

  const toggleTrack = (id) => {
    setTrackIds(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/playlists', {
        title,
        userId,
        trackIds, 
      });      
      setSuccess(true);
      setTitle('');
      setUserId('');
      setTrackIds([]);
    } catch (err) {
      setError('Failed to upload playlist');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Playlist Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded-md" required />
      <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full border px-3 py-2 rounded-md" required>
        <option value="">Select User</option>
        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>

      <h3 className="text-lg font-semibold">Select Tracks</h3>
      <div className="max-h-64 overflow-y-auto border rounded p-3">
        {tracks.map(track => (
          <label key={track.id} className="block mb-2">
            <input type="checkbox" value={track.id} checked={trackIds.includes(track.id)} onChange={() => toggleTrack(track.id)} className="mr-2" />
            {track.title}
          </label>
        ))}
      </div>

      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md block mt-6">Upload Playlist</button>
      {success && <p className="text-green-600 mt-3">Playlist uploaded successfully!</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </form>
  );
};

export default AdminUpload;