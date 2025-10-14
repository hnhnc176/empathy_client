import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../config/axios';

const Report = ({ contentId, contentType, currentUser, onClose }) => {
  const [form, setForm] = useState({
    reason: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    'Spam',
    'Inappropriate Content',
    'Harassment',
    'Misinformation',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser?._id) {
      showErrorToast('Please sign in to report content');
      return;
    }

    if (!form.reason || !form.details) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/reports/create', {
        reported_by: currentUser._id,
        content_type: contentType,
        content_id: contentId,
        reason: form.reason,
        details: form.details
      });

      if (response.data.status === 'success') {
        showSuccessToast('Report submitted successfully');
        onClose?.();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      showErrorToast(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-green-100 p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-4">Submit Report</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold text-green-900 mb-1 text-sm sm:text-base">
            Reason*
          </label>
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full border border-green-800 rounded px-3 py-2 text-sm sm:text-base"
            required
          >
            <option value="">Select a reason</option>
            {reasons.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold text-green-900 mb-1 text-sm sm:text-base">
            Details*
          </label>
          <textarea
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="w-full border border-green-800 rounded px-3 py-2 min-h-[100px] text-sm sm:text-base"
            placeholder="Please provide additional details about your report..."
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 sm:space-x-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black rounded-full px-4 py-2 text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-900 hover:bg-green-800 text-white rounded-full px-4 py-2 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Report;
