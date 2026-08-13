import React, { useState } from 'react';
import { Camera, Plus, Trash2, Settings, Video, Wifi, WifiOff } from 'lucide-react';

export default function CameraManager() {
  const [cameras, setCameras] = useState([
    { id: 1, name: 'CAM 01: Perimeter', url: 'http://10.28.95.19:8080/video', status: 'online', type: 'IP' },
    { id: 2, name: 'CAM 02: Entrance', url: '', status: 'offline', type: 'Webcam' },
    { id: 3, name: 'CAM 03: Parking', url: '', status: 'offline', type: 'IP' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCamera, setNewCamera] = useState({ name: '', url: '', type: 'IP' });

  const addCamera = () => {
    if (newCamera.name) {
      setCameras([...cameras, {
        id: Date.now(),
        name: newCamera.name,
        url: newCamera.url,
        status: 'offline',
        type: newCamera.type
      }]);
      setNewCamera({ name: '', url: '', type: 'IP' });
      setShowAddModal(false);
    }
  };

  const removeCamera = (id) => {
    setCameras(cameras.filter(cam => cam.id !== id));
  };

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-cyan-400 font-bold flex items-center gap-2">
          <Camera size={16} /> CAMERA MANAGEMENT
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold"
        >
          <Plus size={12} /> ADD CAMERA
        </button>
      </div>

      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {cameras.map(camera => (
          <div key={camera.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                camera.status === 'online' ? 'bg-emerald-500/20' : 'bg-red-500/20'
              }`}>
                {camera.status === 'online' ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-red-400" />}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-200">{camera.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{camera.type} • {camera.status}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors">
                <Settings size={14} />
              </button>
              <button
                onClick={() => removeCamera(camera.id)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[400px] shadow-2xl">
            <h4 className="text-lg font-bold text-cyan-400 mb-4">Add New Camera</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Camera Name</label>
                <input
                  type="text"
                  value={newCamera.name}
                  onChange={(e) => setNewCamera({...newCamera, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                  placeholder="e.g., CAM 04: Warehouse"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Camera Type</label>
                <select
                  value={newCamera.type}
                  onChange={(e) => setNewCamera({...newCamera, type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                >
                  <option value="IP">IP Camera</option>
                  <option value="Webcam">Webcam</option>
                  <option value="RTSP">RTSP Stream</option>
                </select>
              </div>
              {newCamera.type !== 'Webcam' && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Stream URL</label>
                  <input
                    type="text"
                    value={newCamera.url}
                    onChange={(e) => setNewCamera({...newCamera, url: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                    placeholder="http://192.168.1.100:8080/video"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addCamera}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium"
              >
                Add Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
