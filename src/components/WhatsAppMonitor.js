import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  LogOut,
  MessageSquare,
  Clock,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode.react';
import apiService, { wsService } from '../services/api';

export const WhatsAppMonitor = () => {
  const [botStatus, setBotStatus] = useState({
    status: 'loading',
    qrCode: null,
    connectedAt: null,
    phoneNumber: null,
    lastError: null,
    messagesProcessed: 0,
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    // Fetch initial status
    fetchBotStatus();

    // Listen for real-time updates
    const handleWSMessage = (data) => {
      if (data.type === 'BOT_STATUS_UPDATE') {
        setBotStatus(data.data);
      }
    };

    wsService.addListener(handleWSMessage);

    // Cleanup
    return () => {
      wsService.removeListener(handleWSMessage);
    };
  }, []);

  const fetchBotStatus = async () => {
    try {
      const status = await apiService.getBotStatus();
      setBotStatus(status);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bot status:', error);
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    if (!window.confirm('Are you sure you want to restart the WhatsApp bot?')) {
      return;
    }

    setRestarting(true);
    try {
      await apiService.request('/api/bot/restart', { method: 'POST' });
      // Status will update via WebSocket
    } catch (error) {
      console.error('Error restarting bot:', error);
      alert('Failed to restart bot');
    } finally {
      setRestarting(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('This will log out the WhatsApp account and require scanning a new QR code. Continue?')) {
      return;
    }

    try {
      await apiService.request('/api/bot/logout', { method: 'POST' });
      // Status will update via WebSocket
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout');
    }
  };

  const getStatusIcon = () => {
    switch (botStatus.status) {
      case 'ready':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'qr':
        return <QrCode className="w-8 h-8 text-blue-500" />;
      case 'disconnected':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (botStatus.status) {
      case 'ready':
        return 'Connected';
      case 'qr':
        return 'Scan QR Code';
      case 'disconnected':
        return 'Disconnected';
      case 'initializing':
        return 'Initializing...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (botStatus.status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'qr':
        return 'bg-blue-100 text-blue-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
          <span className="ml-2">Loading WhatsApp status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Smartphone className="w-6 h-6 mr-2" />
            WhatsApp Bot Monitor
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleRestart}
              disabled={restarting}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${restarting ? 'animate-spin' : ''}`} />
              Restart
            </button>
            {botStatus.status === 'ready' && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getStatusIcon()}
              <div className="ml-4">
                <p className="text-sm text-gray-500">Connection Status</p>
                <p className={`text-lg font-semibold ${getStatusColor()} px-2 py-1 rounded-full inline-block`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
            {botStatus.phoneNumber && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Connected Number</p>
                <p className="text-lg font-semibold">+{botStatus.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Display */}
        {botStatus.status === 'qr' && botStatus.qrCode && (
          <div className="mb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
                Scan QR Code with WhatsApp
              </h3>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <QRCode value={botStatus.qrCode} size={256} level="H" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-2">
                  Open WhatsApp on your phone
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Tap Menu (⋮) or Settings and select "Linked Devices"
                </p>
                <p className="text-sm text-blue-700">
                  Point your phone at this QR code to log in
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {botStatus.lastError && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Connection Error
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{botStatus.lastError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Stats */}
        {botStatus.status === 'ready' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Connected Since</p>
                  <p className="text-sm font-semibold">
                    {botStatus.connectedAt 
                      ? new Date(botStatus.connectedAt).toLocaleString()
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Messages Processed</p>
                  <p className="text-sm font-semibold">{botStatus.messagesProcessed || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Active Chats</p>
                  <p className="text-sm font-semibold">{botStatus.activeChats || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};