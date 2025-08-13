import React from 'react';
import { useFormStore } from '../stores/useFormStore';

export default function MonitoringPhase() {
  const {
    timerActive,
    elapsedTime,
    nextMonitoringDue,
    completedIntervals,
    completeMonitoringInterval,
    alerts
  } = useFormStore();

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get monitoring intervals status
  const intervals = [
    { id: 'post_5min', label: '5 Minutes', targetTime: 5 * 60 },
    { id: 'post_10min', label: '10 Minutes', targetTime: 10 * 60 },
    { id: 'post_15min', label: '15 Minutes', targetTime: 15 * 60 },
    { id: 'post_30min', label: '30 Minutes', targetTime: 30 * 60 }
  ];

  const monitoringAlerts = alerts.filter(alert => alert.category === 'procedural');

  return (
    <div className="space-y-6">
      <div className="bg-cyan-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-cyan-900 mb-4">Phase 7: Post-Intubation Monitoring</h2>
        <p className="text-cyan-700 mb-4">
          Automated monitoring intervals after paralysis administration. Complete assessments at each time point.
        </p>

        {/* Timer Display */}
        {timerActive && (
          <div className="mb-6 p-4 bg-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">Post-Intubation Timer</h3>
                <p className="text-green-600 text-sm">Monitoring patient response and stability</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-700">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-green-600">
                  Since paralysis given
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Intervals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {intervals.map((interval) => {
            const isCompleted = completedIntervals.includes(interval.id);
            const isDue = nextMonitoringDue === interval.id;
            const isOverdue = timerActive && elapsedTime > interval.targetTime && !isCompleted;

            return (
              <div
                key={interval.id}
                className={`p-4 rounded-lg border-2 ${
                  isCompleted ? 'bg-green-50 border-green-200' :
                  isDue ? 'bg-yellow-50 border-yellow-300' :
                  isOverdue ? 'bg-red-50 border-red-300' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${
                    isCompleted ? 'text-green-800' :
                    isDue ? 'text-yellow-800' :
                    isOverdue ? 'text-red-800' :
                    'text-gray-700'
                  }`}>
                    {interval.label}
                  </h4>
                  <div className={`w-3 h-3 rounded-full ${
                    isCompleted ? 'bg-green-500' :
                    isDue ? 'bg-yellow-500' :
                    isOverdue ? 'bg-red-500' :
                    'bg-gray-300'
                  }`} />
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  Target: {formatTime(interval.targetTime)}
                </div>

                {isCompleted && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Completed
                  </div>
                )}

                {isDue && (
                  <button
                    onClick={() => completeMonitoringInterval(interval.id)}
                    className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                  >
                    Complete Assessment
                  </button>
                )}

                {isOverdue && (
                  <div className="text-sm text-red-600 font-medium">
                    ⚠ Overdue - Complete ASAP
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Assessment Form */}
        {nextMonitoringDue && (
          <div className="p-4 bg-white rounded-lg border border-cyan-200">
            <h3 className="font-medium text-cyan-800 mb-4">
              Current Assessment: {intervals.find(i => i.id === nextMonitoringDue)?.label}
            </h3>

            {/* Quick Vital Signs Entry */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR (bpm)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="60-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SBP (mmHg)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="90-140"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DBP (mmHg)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="60-90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="95-100"
                />
              </div>
            </div>

            {/* Complications Checklist */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Complications (check all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['None', 'Hypotension', 'Hypertension', 'Bradycardia', 'Tachycardia', 'Desaturation', 'Arrhythmia'].map((complication) => (
                  <label key={complication} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                    />
                    <span>{complication}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interventions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Interventions Given</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={2}
                placeholder="Describe any medications or interventions..."
              />
            </div>
          </div>
        )}

        {/* Monitoring Alerts */}
        {monitoringAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-cyan-800">Monitoring Alerts</h4>
            {monitoringAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.level === 'critical' ? 'bg-red-50 border-red-400' :
                alert.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                  <div className="ml-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      alert.level === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Actions */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-3">Emergency Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">
              Cardiac Arrest Protocol
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium">
              Failed Intubation Protocol
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium">
              Push-Dose Pressors
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
              Ventilator Adjustment
            </button>
          </div>
        </div>

        {/* Completion Status */}
        {completedIntervals.length === intervals.length && (
          <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-green-800">All Monitoring Intervals Completed</h4>
                <p className="text-green-600 text-sm">Patient monitoring complete. Ready for final assessment.</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium">
                Finalize Registry Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
